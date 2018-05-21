import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import ClassListCreatorWorkflow from './ClassListCreatorWorkflow';
import storybookFrame from './storybookFrame';
import {testProps, chooseYourGradeProps, makeAPlanProps} from './ClassListCreatorWorkflow.test';

function withStoryProps(props = {}) {
  return {
    ...props,
    onStepChanged: action('onStepChanged'),
    onSchoolIdChanged: action('onSchoolIdChanged'),
    onGradeLevelNextYearChanged: action('onGradeLevelNextYearChanged'),
    onEducatorsChanged: action('onEducatorsChanged'),
    onClassroomsCountIncremented: action('onClassroomsCountIncremented'),
    onPlanTextChanged: action('onPlanTextChanged'),
    onClassListsChanged: action('onClassListsChanged'),
    onPrincipalNoteChanged: action('onPrincipalNoteChanged')
  };
}


function render(props) {
  return storybookFrame(<ClassListCreatorWorkflow {...props} />);
}

storiesOf('classlists/ClassListCreatorWorkflow', module) // eslint-disable-line no-undef
  .add('choose your grade', () => render(withStoryProps(chooseYourGradeProps())))
  .add('choose your grade, readonly', () => render(withStoryProps(chooseYourGradeProps({ isEditable: false }))))
  .add('make a plan', () => render(withStoryProps(makeAPlanProps())))
  .add('make a plan, readonly', () => render(withStoryProps(makeAPlanProps({ isEditable: false }))))
  .add('step 3', () => {
    return render(withStoryProps(testProps({
      stepIndex: 3,
      principalNoteText: 'You should remember to talk with...'
    })));
  })
  .add('step 3, readonly', () => {
    return render(withStoryProps(testProps({
      stepIndex: 3,
      principalNoteText: 'You should remember to talk with...',
      isEditable: false
    })));
  });

