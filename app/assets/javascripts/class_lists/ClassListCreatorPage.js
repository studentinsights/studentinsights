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
import {
  initialStudentIdsByRoom,
  studentIdsByRoomAfterRoomsCountChanged
} from './studentIdsByRoomFunctions';
import ClassListCreatorWorkflow from './ClassListCreatorWorkflow';
import uuidv4 from 'uuid/v4';

export const STEPS = [
  'Choose your grade',
  'Make a plan',
  'Create your classrooms',
  'Share with principal',
  'Principal finalizes'
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
      isSubmitted: false,

      // tracking in-flight server requests
      hasFetchedStudents: false,
      hasFetchedGradeLevels: false,
      hasFetchedClassList: false,
      lastSavedSnapshot: null,

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
      principalNoteText: '',
      feedbackText: ''
    };

    this.doAutoSaveChanges = _.throttle(this.doAutoSaveChanges, props.autoSaveIntervalMs);
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
    this.onFeedbackTextChanged = this.onFeedbackTextChanged.bind(this);
    this.onSubmitClicked = this.onSubmitClicked.bind(this);
    this.onBeforeUnload = this.onBeforeUnload.bind(this);
    this.onFetchedClassListError = this.onFetchedClassListError.bind(this);
    this.onFetchStudentsError = this.onFetchStudentsError.bind(this);
    this.onFetchedGradeLevelsError = this.onFetchedGradeLevelsError.bind(this);
  }

  componentDidMount() {
    this.doSizePage();
    window.addEventListener('beforeunload', this.onBeforeUnload);
    this.triggerEffects();
    this.installDebugHook();
  }

  componentDidUpdate() {
    this.doAutoSaveChanges();
    this.triggerEffects();
  }

  componentWillUnmount() {
    if (this.doAutoSaveChanges.flush) this.doAutoSaveChanges.flush(); // flush any queued changes
    window.removeEventListener('beforeunload', this.onBeforeUnload);
  }

  rollbarError(message, params) {
    window.Rollbar.error(message, params);
  }

  // Are there any local changes that we think haven't been synced?
  isDirty() {
    const {lastSavedSnapshot} = this.state;
    if (!this.isSaveable()) return false;
    return !_.isEqual(lastSavedSnapshot, snapshotStateForSaving(this.state));
  }

  // Has the user gotten past initial loading to where there is
  // something worth saving?
  isSaveable() {
    const {
      workspaceId,
      stepIndex,
      schoolId,
      gradeLevelNextYear
    } = this.state;

    // Don't save until they choose a grade level and school
    return (workspaceId && stepIndex !== 0 && schoolId !== null && gradeLevelNextYear !== null);
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
      : [0, 1, 2, 3];
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
    return fetchGradeLevelsJson(workspaceId)
      .then(this.onFetchedGradeLevels)
      .catch(this.onFetchedGradeLevelsError);
  }

  fetchStudents() {
    const {hasFetchedStudents, workspaceId, gradeLevelNextYear, schoolId} = this.state;
    if (hasFetchedStudents) return;
    this.setState({hasFetchedStudents: true});
    return fetchStudentsJson({workspaceId, gradeLevelNextYear, schoolId})
      .then(this.onFetchedStudents)
      .catch(this.onFetchStudentsError);
  }

  fetchClassList() {
    const {hasFetchedClassList, workspaceId} = this.state;
    if (hasFetchedClassList) return;
    this.setState({hasFetchedClassList: true});
    return fetchClassListJson(workspaceId)
      .then(this.onFetchedClassList)
      .catch(this.onFetchedClassListError);
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
  // Autosave unless it's readonly, the user is still at the initial 
  // steps or unless nothing has changed.
  doAutoSaveChanges() {
    const {isEditable} = this.state;
    if (!isEditable) return;
    if (!this.isSaveable()) return;
    if (!this.isDirty()) return;

    this.doSave();
  }

  // Make the save request without any guards. fire-and-forget
  doSave() {
    const snapshotForSaving = snapshotStateForSaving(this.state);
    const payload = {
      ...snapshotForSaving,
      clientNowMs: moment.utc().unix()
    };
    postClassList(payload)
      .then(this.onPostDone.bind(this, snapshotForSaving))
      .catch(this.onPostError.bind(this, snapshotForSaving));
  }

  onPostDone(snapshotForSaving) {
    this.setState({lastSavedSnapshot: snapshotForSaving});
  }

  onPostError(snapshotForSaving, error) {
    this.rollbarError('ClassListCreatorPage#onPostError', error);
  }

  onFetchedGradeLevelsError(error) {
    this.rollbarError('ClassListCreatorPage#onFetchedGradeLevelsError', error);
  }

  onFetchStudentsError(error) {
    this.rollbarError('ClassListCreatorPage#onFetchStudentsError', error);
  }

  onFetchedClassListError(error) {
    this.rollbarError('ClassListCreatorPage#onFetchedClassListError', error);
  }

  onBeforeUnload(event) {
    if (!this.isDirty()) return;

    // Chrome expects the event property to be mutated, other browsers
    // expect the function to return a value;
    const warningMessage = 'You have unsaved changes.';
    event.returnValue = warningMessage; 
    return warningMessage;
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
    const isSubmitted = classList.submitted;
    const {
      authors,
      classroomsCount,
      planText,
      studentIdsByRoom,
      principalNoteText,
      feedbackText
    } = classList.json;

    const stateChange = {
      workspaceId,
      isEditable,
      isSubmitted,
      schoolId,
      gradeLevelNextYear,
      authors,
      classroomsCount,
      planText,
      studentIdsByRoom,
      principalNoteText,
      feedbackText,
      stepIndex: 0, // Ignore last `stepIndex`
    };

    // Also record that the server knows about this state.
    const lastSavedSnapshot = snapshotStateForSaving({
      ...this.state,
      ...stateChange
    });
    this.setState({
      ...stateChange,
      lastSavedSnapshot
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
    const classroomsCount = this.state.classroomsCount + delta;
    if (this.state.studentIdsByRoom === null) {
      this.setState({classroomsCount});
    } else {
      const studentIdsByRoom = studentIdsByRoomAfterRoomsCountChanged(this.state.studentIdsByRoom, classroomsCount);
      this.setState({classroomsCount, studentIdsByRoom});
    }
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

  onFeedbackTextChanged(feedbackText) {
    this.setState({feedbackText});
  }

  onSubmitClicked() {
    const confirmMessage = "Are you sure?  You won't be able to make any changes after submitting.";
    if (!window.confirm(confirmMessage)) return;

    // This updates the UI locally to disable editing and mark as submitted.
    // When that state change is done, we also force saving, since
    // the normal autosave doesn't save anything marked as readonly.
    this.setState({isSubmitted: true, isEditable: false}, () => this.doSave());
  }

  render() {
    const {workspaceId} = this.state;
    if (!workspaceId) return <Loading />;

    const availableSteps = this.availableSteps();
    const isDirty = this.isDirty();
    return (
      <ClassListCreatorWorkflow
        {...this.state}
        isDirty={isDirty}
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
        onFeedbackTextChanged={this.onFeedbackTextChanged}
        onSubmitClicked={this.onSubmitClicked}
      />
    );
  }
}
ClassListCreatorPage.propTypes = {
  defaultWorkspaceId: React.PropTypes.string,
  disableHistory: React.PropTypes.bool,
  disableSizing: React.PropTypes.bool,
  autoSaveIntervalMs: React.PropTypes.number
};
ClassListCreatorPage.defaultProps = {
  autoSaveIntervalMs: 5000
};



function snapshotStateForSaving(state) {
  const {
    workspaceId,
    isSubmitted,
    schoolId,
    gradeLevelNextYear,
    authors,
    classroomsCount,
    planText,
    studentIdsByRoom,
    feedbackText,
    principalNoteText
  } = state;
  return {
    workspaceId,
    isSubmitted,
    schoolId,
    gradeLevelNextYear,
    authors,
    classroomsCount,
    planText,
    studentIdsByRoom,
    feedbackText,
    principalNoteText
  };
}
