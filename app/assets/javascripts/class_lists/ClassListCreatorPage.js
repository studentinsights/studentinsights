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
    this.doTriggerEffects();
    this.installDebugHook();
  }

  componentDidUpdate() {
    this.doSaveChanges();
    this.doTriggerEffects();
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
    window.document.body.style['min-width'] = '1000px';
  }
  
  // Trigger fetches and other initialization
  doTriggerEffects() {
    const {defaultWorkspaceId} = this.props;
    const {
      disableHistory,
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
    
    // Assign workspaceId
    if (!workspaceId) {
      return this.setState({workspaceId: defaultWorkspaceId || uuidv4()});
    }

    // Update URL
    if (window.location.pathname !== `/classlists/${workspaceId}` && !disableHistory) {
      return this.doReplaceState();
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

    // Loading previous session
    if (workspaceId && defaultWorkspaceId) {
      return this.fetchClassList();
    }

    // If we're navigating to `CreateYourLists` for the first time and
    // don't have classroom lists yet, create the default
    if (stepIndex == 2 && studentIdsByRoom === null) {
      const updatedStudentIdsByRoom = initialStudentIdsByRoom(classroomsCount, students);
      return this.setState({studentIdsByRoom: updatedStudentIdsByRoom});
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
    const {workspaceId} = this.state;
    const path = `/classlists/${workspaceId}`;
    window.history.replaceState({}, null, path);
  }

  // This method is throttled.
  doSaveChanges() {
    const {
      workspaceId,
      stepIndex,
      schoolId,
      gradeLevelNextYear,
      educators,
      classroomsCount,
      planText,
      studentIdsByRoom,
      principalNoteText
    } = this.state;

    // Don't save until they choose a grade level and school
    if (!workspaceId || stepIndex === 0 || !schoolId || !gradeLevelNextYear) return;
    const payload = {
      workspaceId,
      stepIndex,
      schoolId,
      gradeLevelNextYear,
      educators,
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
    const {educators, students} = json;
    const authors = educators.filter(educator => educator.id === json.current_educator_id);
    this.setState({
      students,
      educators,
      authors,
    });
  }

  onFetchedClassList(responseJson) {
    const classList = responseJson.class_list;
    const workspaceId = classList.workspace_id;
    const schoolId = classList.school_id;
    const gradeLevelNextYear = classList.grade_level_next_year;
    const {
      stepIndex,
      educators,
      classroomsCount,
      planText,
      studentIdsByRoom,
      principalNoteText
    } = classList.json;
    this.setState({
      workspaceId,
      schoolId,
      gradeLevelNextYear,
      stepIndex,
      educators,
      classroomsCount,
      planText,
      studentIdsByRoom,
      principalNoteText
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
  disableHistory: React.PropTypes.bool
};


