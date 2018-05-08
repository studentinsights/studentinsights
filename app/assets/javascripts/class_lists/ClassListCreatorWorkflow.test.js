import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import ClassListCreatorWorkflow from './ClassListCreatorWorkflow';
import {STEPS} from './ClassListCreatorPage';
import available_grade_levels_json from './fixtures/available_grade_levels_json';
import students_for_grade_level_next_year_json from './fixtures/students_for_grade_level_next_year_json';


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

    // state
    stepIndex: 0,
    workspaceId: 'foo-workspace-id',
    schoolId: null,
    gradeLevelNextYear: null,
    authors: [],
    classroomsCount: 3,
    planText: '',
    studentIdsByRoom: null,
    principalNoteText: '',

    // callbacks
    onStepChanged: jest.fn(),
    onSchoolIdChanged: jest.fn(),
    onGradeLevelNextYearChanged: jest.fn(),
    onEducatorsChanged: jest.fn(),
    onClassroomsCountIncremented: jest.fn(),
    onPlanTextChanged: jest.fn(),
    onClassListsChanged: jest.fn(),
    onPrincipalNoteChanged: jest.fn(),
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
    gradeLevelNextYear: available_grade_levels_json.default_grade_level_next_year,
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

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(<ClassListCreatorWorkflow {...props} />, el);
});

it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(<ClassListCreatorWorkflow {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('snapshots when readonly', () => {
  const props = testProps({ isEditable: false });
  const tree = renderer
    .create(<ClassListCreatorWorkflow {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});