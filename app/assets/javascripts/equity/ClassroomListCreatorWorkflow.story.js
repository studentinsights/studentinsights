import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import ClassroomListCreatorWorkflow from './ClassroomListCreatorWorkflow';
import {STEPS} from './SchoolBalancingTeacherPage';


function testProps(props = {}) {
  return {
    // server
    schools: null,
    gradeLevelsNextYear: null,
    students: null,
    educatorNames: null,

    // config
    steps: STEPS,

    // state
    stepIndex: 0,
    balanceId: 'foo-balance-id',
    schoolId: null,
    gradeLevelNextYear: null,
    educators: [],
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
    onClassroomListsChanged: action('onClassroomListsChanged'),
    onPrincipalNoteChanged: action('onPrincipalNoteChanged'),
    ...props
  };
}

storiesOf('equity/ClassroomListCreatorWorkflow', module) // eslint-disable-line no-undef
  .add('step 0, no data', () => {
    const props = testProps();
    return (
      <div style={{width: '100%', background: '#333'}}>
        <div style={{height: 216}} />
        <div style={{width: 1024, border: '5px solid #333', background: 'white'}}>
          <ClassroomListCreatorWorkflow {...props} />
        </div>
      </div>
    );
  });