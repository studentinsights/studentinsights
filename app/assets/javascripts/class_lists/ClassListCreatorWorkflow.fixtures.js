import _ from 'lodash';
import {STEPS} from './ClassListCreatorPage';
import available_grade_levels_json from './fixtures/available_grade_levels_json';
import students_for_grade_level_next_year_json from './fixtures/students_for_grade_level_next_year_json';
import class_list_json from './fixtures/class_list_json';
import {consistentlyPlacedInitialStudentIdsByRoom} from './studentIdsByRoomFunctions';

// These functions are defined in a separate file, since if they are in the 
// test file itself, when they are imported, the actual tests defined in the same file
// are executed.
//
// This isn't a huge deal, but screws up the Jest snapshots, which then includes
// the output of any snapshot tests in the snapshot file for the test file that
// imported the helper function.
//
// As a concrete example, previously ExportList.test.js imported a test fixture function from
// ClassListCreatorWorkflow.test, which meant ExportList.test.js.snap would also include
// all the snapshots from ClassListCreatorWorkflow.test, and the snapshot tests in ExportList.test.js
// would regress on unrelated changes to ClassListCreatorWorkflow.test snapshots.
export function testProps(props = {}) {
  return {
    // server
    schools: null,
    gradeLevelsNextYear: null,
    students: null,
    educators: null,

    // config
    steps: STEPS,
    availableSteps: STEPS.map((step, index) => index),
    isEditable: true,
    isSubmitted: false,
    isRevisable: false,
    isDirty: false,
    canChangeSchoolOrGrade: true,

    // teacher workspace
    stepIndex: 0,
    workspaceId: 'foo-workspace-id',
    schoolId: null,
    gradeLevelNextYear: null,
    authors: [],
    classroomsCount: 3,
    planText: '',
    studentIdsByRoom: null,
    principalNoteText: '',
    feedbackText: '',

    // principal revisions
    principalStudentIdsByRoom: null,
    principalTeacherNamesByRoom: {},
    onClassListsChangedByPrincipal: jest.fn(),
    onPrincipalTeacherNamesByRoomChanged: jest.fn(),

    // callbacks
    onStepChanged: jest.fn(),
    onSchoolIdChanged: jest.fn(),
    onGradeLevelNextYearChanged: jest.fn(),
    onListTypeTextChanged: jest.fn(),
    onEducatorsChanged: jest.fn(),
    onClassroomsCountIncremented: jest.fn(),
    onPlanTextChanged: jest.fn(),
    onClassListsChanged: jest.fn(),
    onPrincipalNoteChanged: jest.fn(),
    onFeedbackTextChanged: jest.fn(),
    onSubmitClicked: jest.fn(),
    ...props
  };
}


export function chooseYourGradeProps(props = {}) {
  return {
    ...testProps(),
    stepIndex: 0,
    schools: available_grade_levels_json.schools,
    schoolId: available_grade_levels_json.schools[2].id,
    gradeLevelsNextYear: available_grade_levels_json.grade_levels_next_year,
    gradeLevelNextYear: '1',
    listTypeText: 'homeroom',
    ...props
  };
}

export function makeAPlanProps(props = {}) {
  return {
    ...testProps(),
    stepIndex: 1,
    students: students_for_grade_level_next_year_json.students,
    educators: students_for_grade_level_next_year_json.educators,
    authors: students_for_grade_level_next_year_json.educators.slice(0, 1),
    ...props
  };
}

export function shareWithPrincipalProps(props = {}) {
  return {
    ...testProps(),
    stepIndex: 3,
    principalNoteText: 'We think that placing these two students together is really important because of X.',
    feedbackText: 'This is pretty okay!',
    ...props
  };
}

export function exportProps(props = {}) {
  return {
    ...testProps(),
    stepIndex: 5,
    schools: available_grade_levels_json.schools,
    schoolId: available_grade_levels_json.schools[2].id,
    gradeLevelNextYear: '1',
    students: students_for_grade_level_next_year_json.students,
    studentIdsByRoom: class_list_json.class_list.json.studentIdsByRoom,
    educators: students_for_grade_level_next_year_json.educators,
    ...props
  };
}

export function exportPropsWithAllPlaced(props = {}) {
  const defaultExportProps = exportProps();
  const {classroomsCount, students} = defaultExportProps;
  const studentIdsByRoom = consistentlyPlacedInitialStudentIdsByRoom(classroomsCount, students);
  return {
    ...defaultExportProps, 
    studentIdsByRoom: _.clone(studentIdsByRoom),
    principalStudentIdsByRoom: _.clone(studentIdsByRoom),
    ...props
  };
}

export function exportPropsWithMoves(props = {}) {
  const defaultExportProps = exportPropsWithAllPlaced();
  const {studentIdsByRoom} = defaultExportProps;
  return {
    ...defaultExportProps,
    principalStudentIdsByRoom: {
      ...studentIdsByRoom,
      ['room:0']: studentIdsByRoom['room:0'].concat(studentIdsByRoom['room:1'].slice(0, 2)),
      ['room:1']:studentIdsByRoom['room:1'].slice(2)
    },
    ...props
  };
}

export function exportPropsWithTeacherNames(props = {}) {
  return exportPropsWithAllPlaced({
    principalTeacherNamesByRoom: {
      'room:0': 'Kevin',
      'room:1': 'Alex',
      'room:2': 'Uri'
    },
    ...props
  });
}
