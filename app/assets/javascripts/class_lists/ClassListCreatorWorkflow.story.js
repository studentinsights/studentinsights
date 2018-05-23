import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import ClassListCreatorWorkflow from './ClassListCreatorWorkflow';
import storybookFrame from './storybookFrame';
import {
  chooseYourGradeProps,
  makeAPlanProps,
  notesToPrincipalProps
} from './ClassListCreatorWorkflow.test';

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
    onPrincipalNoteChanged: action('onPrincipalNoteChanged'),
    onFeedbackTextChanged: action('onFeedbackTextChanged'),
    onSubmitClicked: action('onSubmitClicked')
  };
}


function render(props) {
  return storybookFrame(<ClassListCreatorWorkflow {...props} />);
}

storiesOf('classlists/ClassListCreatorWorkflow', module) // eslint-disable-line no-undef
  .add('Choose your grade', () => render(withStoryProps(chooseYourGradeProps())))
  .add('Choose your grade, already done', () => render(withStoryProps(chooseYourGradeProps({ canChangeSchoolOrGrade: false }))))
  .add('Choose your grade, readonly', () => render(withStoryProps(chooseYourGradeProps({ isEditable: false }))))
  .add('Make a plan', () => render(withStoryProps(makeAPlanProps())))
  .add('Make a plan, readonly', () => render(withStoryProps(makeAPlanProps({ isEditable: false }))))
  .add('Notes to principal', () => render(withStoryProps(notesToPrincipalProps())))
  .add('Notes to principal, saving', () => {
    return render(withStoryProps(notesToPrincipalProps({
      isEditable: false,
      isSubmitted: true,
      isDirty: true,
    })));
  })
  .add('Notes to principal, readonly', () => {
    return render(withStoryProps(notesToPrincipalProps({
      isEditable: false,
      isSubmitted: true
    })));
  });

