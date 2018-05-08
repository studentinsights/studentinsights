import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import ClassListCreatorWorkflow from './ClassListCreatorWorkflow';
import {STEPS} from './ClassListCreatorPage';


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