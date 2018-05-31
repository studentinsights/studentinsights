import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import ClassListCreatorWorkflow from './ClassListCreatorWorkflow';
import {STEPS} from './ClassListCreatorPage';
import available_grade_levels_json from './fixtures/available_grade_levels_json';
import students_for_grade_level_next_year_json from './fixtures/students_for_grade_level_next_year_json';
import class_list_json from './fixtures/class_list_json';


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
    gradeLevelNextYear: available_grade_levels_json.grade_levels_next_year[0],
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
    gradeLevelNextYear: available_grade_levels_json.grade_levels_next_year[0],
    students: students_for_grade_level_next_year_json.students,
    studentIdsByRoom: class_list_json.class_list.json.studentIdsByRoom,
    ...props
  };
}

function snapshotRender(props) {
  return renderer
    .create(<ClassListCreatorWorkflow {...props} />)
    .toJSON();
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(<ClassListCreatorWorkflow {...props} />, el);
});

it('chooseYourGradeProps', () => {
  expect(snapshotRender(chooseYourGradeProps())).toMatchSnapshot();
  expect(snapshotRender(chooseYourGradeProps({ isEditable: false }))).toMatchSnapshot();
  expect(snapshotRender(chooseYourGradeProps({ canChangeSchoolOrGrade: false }))).toMatchSnapshot();
});

it('makeAPlanProps', () => {
  expect(snapshotRender(makeAPlanProps())).toMatchSnapshot();
  expect(snapshotRender(makeAPlanProps({ isEditable: false }))).toMatchSnapshot();
});

it('notesToPrincipalProps', () => {
  expect(snapshotRender(notesToPrincipalProps())).toMatchSnapshot();
  expect(snapshotRender(notesToPrincipalProps({ isEditable: false, isSubmitted: true }))).toMatchSnapshot();
});
