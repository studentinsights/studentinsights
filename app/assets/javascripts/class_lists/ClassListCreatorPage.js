import React from 'react';
import _ from 'lodash';
import {sortByGrade} from '../helpers/SortHelpers';
import {
  fetchGradeLevelsJson,
  fetchStudentsJson,
  fetchClassListJson,
  postClassList
} from './api';
import Loading from '../components/Loading';
import {initialStudentIdsByRoom} from './studentIdsByRoomFunctions';
import ClassListCreatorWorkflow from './ClassListCreatorWorkflow';
import uuidv4 from 'uuid/v4';

export const STEPS = [
  'Choose your grade',
  'Make a plan',
  'Create your classrooms',
  'Notes to principal',
  'Submit to principal'
];


// Root page component.
// This component manages state transitions and hands off requests to the server
// and rendering to other components.  On state changes, it saves to the server
// with some throttling to prevent too much server communication.
export default class ClassListCreatorPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stepIndex: 0,
      isEditable: true,

      // tracking in-flight server requests
      hasFetchedStudents: false,
      hasFetchedGradeLevels: false,
      hasFetchedClassList: false,

      // choosing school and grade
      schools: null, // from server
      gradeLevelsNextYear: null, // from server
      schoolId: null,
      gradeLevelNextYear: null,

      // workspace
      educators: null, // from server
      students: null, // from server
      classroomsCount: 4,
      authors: [],
      planText: '',
      studentIdsByRoom: null,
      principalNoteText: ''
    };

    this.doSaveChanges = _.throttle(this.doSaveChanges, 5000);
    this.fetchGradeLevels = this.fetchGradeLevels.bind(this);
    this.fetchStudents = this.fetchStudents.bind(this);
    this.fetchClassList = this.fetchClassList.bind(this);
    this.onFetchedGradeLevels = this.onFetchedGradeLevels.bind(this);
    this.onFetchedStudents = this.onFetchedStudents.bind(this);
    this.onFetchedClassList = this.onFetchedClassList.bind(this);
    this.onStepChanged = this.onStepChanged.bind(this);
    this.onSchoolIdChanged = this.onSchoolIdChanged.bind(this);
    this.onGradeLevelNextYearChanged = this.onGradeLevelNextYearChanged.bind(this);
    this.onClassroomsCountIncremented = this.onClassroomsCountIncremented.bind(this);
    this.onPlanTextChanged = this.onPlanTextChanged.bind(this);
    this.onAuthorsChanged = this.onAuthorsChanged.bind(this);
    this.onClassListsChanged = this.onClassListsChanged.bind(this);
    this.onPrincipalNoteChanged = this.onPrincipalNoteChanged.bind(this);
  }

  componentDidMount() {
    this.doSizePage();
    window.addEventListener('beforeunload', this.onBeforeUnload);
    this.triggerEffects();
    this.installDebugHook();
  }

  componentDidUpdate() {
    this.doSaveChanges();
    this.triggerEffects();
  }

  componentWillUnmount() {
    if (this.doSaveChanges.flush) this.doSaveChanges.flush(); // flush any queued changes
    window.removeEventListener('beforeunload', this.onBeforeUnload);
  }

  // Describes which steps are available to be navigated to,
  // not which data has been loaded for.  Steps handle showing their own loading
  // states based on data.
  availableSteps() {
    const {
      schoolId,
      gradeLevelNextYear
    } = this.state;

    return (schoolId === null || gradeLevelNextYear === null)
      ? [0]
      : [0, 1, 2, 3, 4];
  }

  // This is a debug hook for iterating on particular production data sets locally
  // during development.
  installDebugHook() {
    window.forceDebug = this.onForceDebug.bind(this);
  }

  doSizePage() {
    const {disableSizing} = this.props;
    if (disableSizing) return;
    
    // Reach outside component to change styles for page and conatiner, to take up
    // the entire vertical height.
    window.document.documentElement.style.height = '100%';
    window.document.body.style.height = '100%';
    window.document.body.style.display = 'flex';
    window.document.body.style['flex-direction'] = 'column';
    window.document.getElementById('main').style.flex = 1;
    window.document.getElementById('main').style.display = 'flex';
    
    // Prevent horizontal scrollbar from showing.
    window.document.body.style['min-width'] = '1000px';
  }
  
  // Trigger fetches and other initialization
  triggerEffects() {
    const {defaultWorkspaceId} = this.props;
    const {
      workspaceId,
      stepIndex,
      schoolId,
      gradeLevelNextYear,
      schools,
      gradeLevelsNextYear,
      students,
      educators,
      classroomsCount,
      studentIdsByRoom
    } = this.state;
    
    // Update URL (no state change)
    if (workspaceId && window.location.pathname !== `/classlists/${workspaceId}`) {
      this.doReplaceState();
    }

    // Assign workspaceId
    if (!workspaceId) {
      return this.setState({workspaceId: defaultWorkspaceId || uuidv4()});
    }

    // New classlist
    // () => {schools, grades}
    if (schools === null || gradeLevelsNextYear === null) {
      return this.fetchGradeLevels();
    }

    // The user has chosen a school and grade and moved past the first screen.
    // Fetch the students for that grade, and the list of educators.
    // (schoolId, gradeLevelNextYear) => {students, educators}
    if (schoolId !== null && gradeLevelNextYear !== null && (students == null || educators == null) && (stepIndex !== 0 || defaultWorkspaceId)) {
      return this.fetchStudents();
    }

    // If we're navigating to `CreateYourLists` for the first time and
    // don't have classroom lists yet, create the default
    if (stepIndex == 2 && students !== null && studentIdsByRoom === null) {
      const updatedStudentIdsByRoom = initialStudentIdsByRoom(classroomsCount, students);
      return this.setState({studentIdsByRoom: updatedStudentIdsByRoom});
    }
     
    // Loading previous session
    if (workspaceId && defaultWorkspaceId && studentIdsByRoom === null) {
      return this.fetchClassList();
    }
  }

  fetchGradeLevels() {
    const {hasFetchedGradeLevels, workspaceId} = this.state;
    if (hasFetchedGradeLevels) return;
    this.setState({hasFetchedGradeLevels: true});
    return fetchGradeLevelsJson(workspaceId).then(this.onFetchedGradeLevels);
  }

  fetchStudents() {
    const {hasFetchedStudents, workspaceId, gradeLevelNextYear, schoolId} = this.state;
    if (hasFetchedStudents) return;
    this.setState({hasFetchedStudents: true});
    return fetchStudentsJson({workspaceId, gradeLevelNextYear, schoolId}).then(this.onFetchedStudents);
  }

  doReplaceState() {
    const {disableHistory} = this.props;
    const {workspaceId} = this.state;
    const path = `/classlists/${workspaceId}`;
    if (!disableHistory) {
      window.history.replaceState({}, null, path);
    }
  }

  // This method is throttled.
  doSaveChanges() {
    const {
      isEditable,
      workspaceId,
      stepIndex,
      schoolId,
      gradeLevelNextYear,
      authors,
      classroomsCount,
      planText,
      studentIdsByRoom,
      principalNoteText
    } = this.state;

    // View-only
    if (!isEditable) return;

    // Don't save until they choose a grade level and school
    if (!workspaceId || stepIndex === 0 || !schoolId || !gradeLevelNextYear) return;
    
    const payload = {
      workspaceId,
      stepIndex,
      schoolId,
      gradeLevelNextYear,
      authors,
      classroomsCount,
      planText,
      studentIdsByRoom,
      principalNoteText,
      clientNowMs: moment.utc().unix()
    };
    postClassList(payload);
  }

  fetchClassList() {
    const {hasFetchedClassList, workspaceId} = this.state;
    if (hasFetchedClassList) return;
    this.setState({hasFetchedClassList: true});
    return fetchClassListJson(workspaceId).then(this.onFetchedClassList);
  }

  // TODO(kr) check this on IE
  onBeforeUnload(event) {
    const isDirty = true;
    return (isDirty)
      ? 'You have unsaved changes.'
      : undefined;
  }

  onForceDebug(nextState) {
    const {gradeLevelNextYear, students, studentIdsByRoom} = nextState;
    this.setState({gradeLevelNextYear, students, studentIdsByRoom, stepIndex: 2});
  }

  onFetchedGradeLevels(json) {
    const gradeLevelsNextYear = json.grade_levels_next_year.sort(sortByGrade);
    const {schools} = json;

    this.setState({
      schools,
      gradeLevelsNextYear
    });
  }

  onFetchedStudents(json) {
    const {isEditable, authors} = this.state;
    const {educators, students} = json;

    // initialize if we just got the list of educators, and there's no one set yet
    const updatedAuthors = (authors.length === 0 && isEditable)
      ? educators.filter(educator => educator.id === json.current_educator_id)
      : authors;
    this.setState({
      students,
      educators,
      authors: updatedAuthors
    });
  }

  onFetchedClassList(responseJson) {
    const isEditable = responseJson.is_editable;
    const classList = responseJson.class_list;
    const workspaceId = classList.workspace_id;
    const schoolId = classList.school_id;
    const gradeLevelNextYear = classList.grade_level_next_year;
    const {
      authors,
      classroomsCount,
      planText,
      studentIdsByRoom,
      principalNoteText
    } = classList.json;
    this.setState({
      workspaceId,
      isEditable,
      schoolId,
      gradeLevelNextYear,
      authors,
      classroomsCount,
      planText,
      studentIdsByRoom,
      principalNoteText,
      stepIndex: 0, // Ignore last `stepIndex`
    });
  }

  onStepChanged(stepIndex) {
    this.setState({stepIndex});
  }

  // TODO(kr) warn about resetting students?
  onSchoolIdChanged(schoolId) {
    this.setState({schoolId});
  }

  // TODO(kr) warn about resetting students?
  onGradeLevelNextYearChanged(gradeLevelNextYear) {
    this.setState({gradeLevelNextYear});
  }

  onAuthorsChanged(authors) {
    this.setState({authors}); 
  }

  // TODO(kr) warn about resetting students?
  onClassroomsCountIncremented(delta) {
    const {classroomsCount} = this.state;
    const updatedClassroomsCount = classroomsCount + delta;
    this.setState({classroomsCount: updatedClassroomsCount});
  }

  onPlanTextChanged(planText) {
    this.setState({planText});
  }

  onClassListsChanged(studentIdsByRoom) {
    this.setState({studentIdsByRoom});
  }

  onPrincipalNoteChanged(principalNoteText) {
    this.setState({principalNoteText});
  }

  render() {
    const {workspaceId} = this.state;
    if (!workspaceId) return <Loading />;

    const availableSteps = this.availableSteps();
    return (
      <ClassListCreatorWorkflow
        {...this.state}
        steps={STEPS}
        availableSteps={availableSteps}
        onStepChanged={this.onStepChanged}
        onSchoolIdChanged={this.onSchoolIdChanged}
        onGradeLevelNextYearChanged={this.onGradeLevelNextYearChanged}
        onEducatorsChanged={this.onAuthorsChanged}
        onClassroomsCountIncremented={this.onClassroomsCountIncremented}
        onPlanTextChanged={this.onPlanTextChanged}
        onClassListsChanged={this.onClassListsChanged}
        onPrincipalNoteChanged={this.onPrincipalNoteChanged}
      />
    );
  }
}
ClassListCreatorPage.propTypes = {
  defaultWorkspaceId: React.PropTypes.string,
  disableHistory: React.PropTypes.bool,
  disableSizing: React.PropTypes.bool
};


