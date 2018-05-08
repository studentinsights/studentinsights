import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import ClassListCreatorWorkflow from './ClassListCreatorWorkflow';
import storybookFrame from './storybookFrame';
import {testProps} from './ClassListCreatorWorkflow.test';
import available_grade_levels_json from './fixtures/available_grade_levels_json';

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
  .add('step 0, with data', () => {
    return render(storyProps({
      stepIndex: 0,
      schools: available_grade_levels_json.schools,
      gradeLevelsNextYear: available_grade_levels_json.grade_levels_next_year
    }));
  })
  .add('step 0, readonly', () => {
    return render(storyProps({
      stepIndex: 0,
      schools: available_grade_levels_json.schools,
      schoolId: available_grade_levels_json.schools[2].id,
      gradeLevelsNextYear: available_grade_levels_json.grade_levels_next_year,
      gradeLevelNextYear: available_grade_levels_json.default_grade_level_next_year,
      isEditable: false
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
  .add('step 3, with data', () => {
    return render(storyProps({
      stepIndex: 3,
      principalNoteText: 'You should remember to talk with...'
    }));
  })
  .add('step 3, readonly', () => {
    return render(storyProps({
      stepIndex: 3,
      principalNoteText: 'You should remember to talk with...',
      isEditable: false
    }));
  });

