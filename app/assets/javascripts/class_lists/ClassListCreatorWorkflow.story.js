import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import ClassListCreatorWorkflow from './ClassListCreatorWorkflow';
import storybookFrame from './storybookFrame';
import {STEPS} from './ClassListCreatorPage';


function testProps(props = {}) {
  return {
    // server
    schools: null,
    gradeLevelsNextYear: null,
    students: null,
    educators: null,

    // config
    steps: STEPS,
    availableSteps: [],

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
    onStepChanged: action('onStepChanged'),
    onSchoolIdChanged: action('onSchoolIdChanged'),
    onGradeLevelNextYearChanged: action('onGradeLevelNextYearChanged'),
    onEducatorsChanged: action('onEducatorsChanged'),
    onClassroomsCountIncremented: action('onClassroomsCountIncremented'),
    onPlanTextChanged: action('onPlanTextChanged'),
    onClassListsChanged: action('onClassListsChanged'),
    onPrincipalNoteChanged: action('onPrincipalNoteChanged'),
    ...props
  };
}

function render(props) {
  return storybookFrame(<ClassListCreatorWorkflow {...props} />);
}

storiesOf('equity/ClassListCreatorWorkflow', module) // eslint-disable-line no-undef
  .add('step 0, no data', () => {
    return render(testProps({
      stepIndex: 0,
      availableSteps: [0, 1]
    }));
  })
  .add('step 1, no data', () => {
    return render(testProps({
      stepIndex: 1,
      availableSteps: [0, 1]
    }));
  })
  .add('step 2, no data', () => {
    return render(testProps({
      stepIndex: 2,
      availableSteps: [0, 1, 2]
    }));
  })
  .add('step 3, no data', () => {
    return render(testProps({
      stepIndex: 3,
      availableSteps: [0, 1, 2, 3]
    }));
  });

