import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import ClassListCreatorWorkflow from './ClassListCreatorWorkflow';
import storybookFrame from './storybookFrame';
import {testProps} from './ClassListCreatorWorkflow.test';


function storyProps(props = {}) {
  return {
    ...testProps(),
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
    return render(storyProps({
      stepIndex: 0,
      availableSteps: [0, 1]
    }));
  })
  .add('step 0, readonly', () => {
    return render(storyProps({
      isEditable: false,
      stepIndex: 0,
      availableSteps: [0, 1]
    }));
  })
  .add('step 1, no data', () => {
    return render(storyProps({
      stepIndex: 1,
      availableSteps: [0, 1]
    }));
  })
  .add('step 2, no data', () => {
    return render(storyProps({
      stepIndex: 2,
      availableSteps: [0, 1, 2]
    }));
  })
  .add('step 3, no data', () => {
    return render(storyProps({
      stepIndex: 3,
      availableSteps: [0, 1, 2, 3]
    }));
  });

