import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import ClassListCreatorWorkflow from './ClassListCreatorWorkflow';
import storybookFrame from './storybookFrame';
import {
  chooseYourGradeProps,
  makeAPlanProps,
  shareWithPrincipalProps,
  exportProps
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
  .add('Share with principal', () => render(withStoryProps(shareWithPrincipalProps())))
  .add('Share with principal, saving', () => {
    return render(withStoryProps(shareWithPrincipalProps({
      isEditable: false,
      isSubmitted: true,
      isDirty: true,
    })));
  })
  .add('Share with principal, readonly', () => {
    return render(withStoryProps(shareWithPrincipalProps({
      isEditable: false,
      isSubmitted: true
    })));
  })
  .add('Export', () => render(withStoryProps(exportProps())));

