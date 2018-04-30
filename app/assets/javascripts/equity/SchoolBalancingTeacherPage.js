import React from 'react';
import _ from 'lodash';
import {sortByGrade} from '../helpers/SortHelpers';
import {
  fetchGradeLevelsJson,
  fetchStudentsJson,
  postBalancingState
} from './api';
import {initialStudentIdsByRoom} from './studentIdsByRoomFunctions';
import ClassroomListCreatorView from './ClassroomListCreatorView';
import uuidv4 from 'uuid/v4';

const STEPS = [
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
export default class SchoolBalancingTeacherPage extends React.Component {
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
      classroomsCount: 5,
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
    this.onEducatorsChanged = this.onEducatorsChanged.bind(this);
    this.onClassroomListsChanged = this.onClassroomListsChanged.bind(this);
    this.onPrincipalNoteChanged = this.onPrincipalNoteChanged.bind(this);
  }

  componentDidMount() {
    // rewrite URL with balanceId
    const {balanceId} = this.state;
    const path = `/balancing/${balanceId}`;
    window.history.replaceState({}, null, path);

    // schedule warn or navigate away
    window.addEventListener('beforeunload', this.onBeforeUnload);
  }

  componentDidUpdate() {
    this.doSaveChanges();
  }

  componentWillUnmount() {
    this.doSaveChanges.flush(); // flush any queued changes
    window.removeEventListener('beforeunload');
  }

  // This method is throttled.
  doSaveChanges() {
    const {
      balanceId,
      schoolId,
      gradeLevelNextYear,
      educators,
      classroomsCount,
      planText,
      studentIdsByRoom,
      principalNotesText
    } = this.state;
    const payload = {
      balanceId,
      schoolId,
      gradeLevelNextYear,
      educators,
      classroomsCount,
      planText,
      studentIdsByRoom,
      principalNotesText,
      clientNowMs: moment.utc().unix()
    };
    postBalancingState(payload);
  }

  fetchGradeLevels() {
    const {balanceId} = this.state;
    return fetchGradeLevelsJson(balanceId);
  }

  fetchStudents() {
    const {balanceId, gradeLevelNextYear, schoolId} = this.state;
    return fetchStudentsJson({balanceId, gradeLevelNextYear, schoolId});
  }

  // TODO(kr) check this on IE
  onBeforeUnload(event) {
    const isDirty = true;
    return (isDirty)
      ? 'You have unsaved changes.'
      : undefined;
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

  // If we're navigating to `CreateYourClassrooms` for the first time and
  // don't have classroom lists yet, create the default
  onStepChanged(stepIndex) {
    const {classroomsCount, students, studentIdsByRoom} = this.state;
    if (stepIndex == 2 && studentIdsByRoom === null) {
      const studentIdsByRoom = initialStudentIdsByRoom(classroomsCount, students);
      this.setState({stepIndex, studentIdsByRoom});
    } else {
      this.setState({stepIndex});
    }
  }

  // TODO(kr) warn about resetting students?
  onSchoolIdChanged(item) {
    this.setState({schoolId: item.value});
  }

  // TODO(kr) warn about resetting students?
  onGradeLevelNextYearChanged(item) {
    this.setState({gradeLevelNextYear: item.value});
  }

  onEducatorsChanged(educators) {
    this.setState({educators}); 
  }

  onClassroomListsChanged(studentIdsByRoom) {
    this.setState({studentIdsByRoom});
  }

  onPrincipalNoteChanged(principalNoteText) {
    this.setState({principalNoteText});
  }

  render() {
    return (
      <ClassroomListCreatorView
        {...this.state}
        steps={STEPS}
        onStepChanged={this.onStepChanged}
        onSchoolIdChanged={this.onSchoolIdChanged}
        onGradeLevelNextYearChanged={this.onGradeLevelNextYearChanged}
        onEducatorsChanged={this.onEducatorsChanged}
        onClassroomListsChanged={this.onClassroomListsChanged}
        onPrincipalNoteChanged={this.onPrincipalNoteChanged}
      />
    );
  }
}
SchoolBalancingTeacherPage.propTypes = {
  balanceId: React.PropTypes.string
};


