import React from 'react';
import _ from 'lodash';
import {sortByGrade} from '../helpers/SortHelpers';
import {
  fetchGradeLevelsJson,
  fetchStudentsJson,
  postClassList
} from './api';
import {initialStudentIdsByRoom, areAllStudentsPlaced} from './studentIdsByRoomFunctions';
import ClassListCreatorWorkflow from './ClassListCreatorWorkflow';
import uuidv4 from 'uuid/v4';

export const STEPS = [
  'Choose your grade',
  'Make a plan',
  'Create your classrooms',
  'Notes to principal',
  'Submit to principal'
];

// Entry point for grade-level teaching teams to create classroom lists,
// which creates a new client-side `workspaceId`.
export function ClassListCreatorPageEntryPoint({disableHistory}) {
  return <ClassListCreatorPage
    workspaceId={uuidv4()}
    disableHistory={disableHistory} />;
}
ClassListCreatorPageEntryPoint.propTypes = {
  disableHistory: React.PropTypes.bool
};

// Root page component.
// This component manages state transitions and hands off requests to the server
// and rendering to other components.  On state changes, it saves to the server
// with some throttling to prevent too much server communication.
export default class ClassListCreatorPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stepIndex: 0,
      isFetchingStudents: false,
      isFetchingGradeLevels: false,

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
    this.onFetchedGradeLevels = this.onFetchedGradeLevels.bind(this);
    this.onFetchedStudents = this.onFetchedStudents.bind(this);
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
    this.doReplaceState();
    window.addEventListener('beforeunload', this.onBeforeUnload);
    this.triggerFetches();
    this.installDebugHook();
  }

  componentDidUpdate() {
    this.doSaveChanges();
    this.triggerFetches();
  }

  componentWillUnmount() {
    if (this.doSaveChanges.flush) this.doSaveChanges.flush(); // flush any queued changes
    window.removeEventListener('beforeunload', this.onBeforeUnload);
  }

  // This is a debug hook for iterating on particular production data sets locally
  // during development.
  installDebugHook() {
    window.forceDebug = this.onForceDebug.bind(this);
  }

  doSizePage() {
    window.document.body.style['min-width'] = '1000px';
  }
  
  doReplaceState() {
    const {workspaceId} = this.props;
    const path = `/classlists/${workspaceId}`;
    if (!this.props.disableHistory) {
      window.history.replaceState({}, null, path);
    }
  }

  // This method is throttled.
  doSaveChanges() {
    const {workspaceId} = this.props;
    const {
      stepIndex,
      schoolId,
      gradeLevelNextYear,
      educators,
      classroomsCount,
      planText,
      studentIdsByRoom,
      principalNotesText
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
      principalNotesText,
      clientNowMs: moment.utc().unix()
    };
    postClassList(payload);
  }

  // Trigger fetches and other initialization
  triggerFetches() {
    const {
      isFetchingGradeLevels,
      isFetchingStudents,
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
    
    // Initial load
    // () => {schools, grades}
    if (schools === null || gradeLevelsNextYear === null) {
      if (isFetchingGradeLevels) return;
      this.fetchGradeLevels().then(this.onFetchedGradeLevels);
    }

    // The user has chosen a school and grade and moved past the first screen.
    // Fetch the students for that grade, and the list of educators.
    // (schoolId, gradeLevelNextYear) => {students, educators}
    if (schoolId !== null && gradeLevelNextYear !== null && stepIndex !== 0 && (students == null || educators == null)) {
      if (isFetchingStudents) return;
      this.fetchStudents().then(this.onFetchedStudents);
    }

    // If we're navigating to `CreateYourLists` for the first time and
    // don't have classroom lists yet, create the default
    if (stepIndex == 2 && studentIdsByRoom === null) {
      const studentIdsByRoom = initialStudentIdsByRoom(classroomsCount, students);
      this.setState({studentIdsByRoom});
    }
  }

  fetchGradeLevels() {
    const {workspaceId} = this.props;
    return fetchGradeLevelsJson(workspaceId);
  }

  fetchStudents() {
    const {workspaceId} = this.props;
    const {gradeLevelNextYear, schoolId} = this.state;
    return fetchStudentsJson({workspaceId, gradeLevelNextYear, schoolId});
  }

  // Describes which steps are available to be navigated to,
  // not which data has been loaded for.
  availableSteps() {
    const {
      schoolId,
      gradeLevelNextYear
      // educators,
      // planText,
      // studentIdsByRoom,
      // principalNoteText
    } = this.state;

    return (schoolId === null || gradeLevelNextYear === null)
      ? [0]
      : [0, 1, 2, 3, 4];

    // const availableSteps = [0];

    // if (educators.length > 0 && planText !== '') {
    //   availableSteps.push(2);
    // }

    // if (studentIdsByRoom !== null && areAllStudentsPlaced(studentIdsByRoom)) {
    //   availableSteps.push(3);
    // }

    // if (principalNoteText !== '') {
    //   availableSteps.push(4);
    // }

    // return availableSteps;
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
      isFetchingGradeLevels: false,
      schools,
      gradeLevelsNextYear
    });
  }

  onFetchedStudents(json) {
    const {educators, students} = json;
    const authors = educators.filter(educator => educator.id === json.current_educator_id);
    this.setState({
      isFetchingStudents: false,
      students,
      educators,
      authors,
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
    const {workspaceId} = this.props;
    const availableSteps = this.availableSteps();
    return (
      <ClassListCreatorWorkflow
        {...this.state}
        workspaceId={workspaceId}
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
  workspaceId: React.PropTypes.string.isRequired,
  disableHistory: React.PropTypes.bool
};


