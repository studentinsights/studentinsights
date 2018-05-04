import React from 'react';
import _ from 'lodash';
import {sortByGrade} from '../helpers/SortHelpers';
import {
  fetchGradeLevelsJson,
  fetchStudentsJson,
  postClassroomsForGrade
} from './api';
import {initialStudentIdsByRoom, areAllStudentsPlaced} from './studentIdsByRoomFunctions';
import ClassroomListCreatorWorkflow from './ClassroomListCreatorWorkflow';
import uuidv4 from 'uuid/v4';

export const STEPS = [
  'Choose your grade',
  'Make a plan',
  'Create your classrooms',
  'Notes to principal',
  'Submit to principal'
];

// Entry point for grade-level teaching teams to create classroom lists.
// This component manages state transitions and hands off requests to the server
// and rendering to other components.  On state changes, it saves to the server
// with some throttling to prevent too much server communication.
export default class ClassroomListCreatorPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      balanceId: props.balanceId || uuidv4(),
      stepIndex: 0,

      // first
      schools: null, // from server
      gradeLevelsNextYear: null, // from server
      schoolId: null,
      gradeLevelNextYear: null,

      // second
      educatorNames: null, // from server
      students: null, // from server
      classroomsCount: 4,
      educators: [],
      planText: '',

      // third
      studentIdsByRoom: null,

      // fourth
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
    this.onEducatorsChanged = this.onEducatorsChanged.bind(this);
    this.onClassroomListsChanged = this.onClassroomListsChanged.bind(this);
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
    const {balanceId} = this.state;
    const path = `/balancing/${balanceId}`;
    if (!this.props.disableHistory) {
      window.history.replaceState({}, null, path);
    }
  }

  // This method is throttled.
  doSaveChanges() {
    const {
      balanceId,
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
    if (!balanceId) return;
    if (!schoolId) return;
    if (!gradeLevelNextYear) return;
    const payload = {
      balanceId,
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
    postClassroomsForGrade(payload);
  }

  // Trigger fetches and other initialization
  triggerFetches() {
    const {
      stepIndex,
      classroomsCount,
      students,
      schools,
      gradeLevelsNextYear,
      studentIdsByRoom
    } = this.state;
    
    if (stepIndex === 0 && (schools === null || gradeLevelsNextYear === null)) {
      this.fetchGradeLevels().then(this.onFetchedGradeLevels);
    }

    if (stepIndex === 1 && students === null) {
      this.fetchStudents().then(this.onFetchedStudents);
    }

    // If we're navigating to `CreateYourClassrooms` for the first time and
    // don't have classroom lists yet, create the default
    if (stepIndex == 2 && studentIdsByRoom === null) {
      const studentIdsByRoom = initialStudentIdsByRoom(classroomsCount, students);
      this.setState({studentIdsByRoom});
    }
  }

  fetchGradeLevels() {
    const {balanceId} = this.state;
    return fetchGradeLevelsJson(balanceId);
  }

  fetchStudents() {
    const {balanceId, gradeLevelNextYear, schoolId} = this.state;
    return fetchStudentsJson({balanceId, gradeLevelNextYear, schoolId});
  }

  // Describes which steps are available to be navigated to,
  // not which data has been loaded for.
  availableSteps() {
    const {
      schoolId,
      gradeLevelNextYear,
      educators,
      planText,
      studentIdsByRoom,
      principalNoteText
    } = this.state;
    const availableSteps = [0];

    if (schoolId !== null && gradeLevelNextYear !== null) {
      availableSteps.push(1);
    }

    if (educators.length > 0 && planText !== '') {
      availableSteps.push(2);
    }

    if (studentIdsByRoom !== null && areAllStudentsPlaced(studentIdsByRoom)) {
      availableSteps.push(3);
    }

    if (principalNoteText !== '') {
      availableSteps.push(4);
    }

    return availableSteps;
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
    const educatorNames = json.educator_names;
    const currentEducatorName = json.current_educator_name;
    const {students} = json;

    this.setState({
      educatorNames,
      students,
      educators: [currentEducatorName]
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

  onEducatorsChanged(educators) {
    this.setState({educators}); 
  }

  onClassroomsCountIncremented(delta) {
    const {classroomsCount} = this.state;
    const updatedClassroomsCount = classroomsCount + delta;
    this.setState({classroomsCount: updatedClassroomsCount});
  }

  onPlanTextChanged(planText) {
    this.setState({planText});
  }

  onClassroomListsChanged(studentIdsByRoom) {
    this.setState({studentIdsByRoom});
  }

  onPrincipalNoteChanged(principalNoteText) {
    this.setState({principalNoteText});
  }

  render() {
    const availableSteps = this.availableSteps();
    return (
      <ClassroomListCreatorWorkflow
        {...this.state}
        steps={STEPS}
        availableSteps={availableSteps}
        onStepChanged={this.onStepChanged}
        onSchoolIdChanged={this.onSchoolIdChanged}
        onGradeLevelNextYearChanged={this.onGradeLevelNextYearChanged}
        onEducatorsChanged={this.onEducatorsChanged}
        onClassroomsCountIncremented={this.onClassroomsCountIncremented}
        onPlanTextChanged={this.onPlanTextChanged}
        onClassroomListsChanged={this.onClassroomListsChanged}
        onPrincipalNoteChanged={this.onPrincipalNoteChanged}
      />
    );
  }
}
ClassroomListCreatorPage.propTypes = {
  balanceId: React.PropTypes.string,
  disableHistory: React.PropTypes.bool
};


