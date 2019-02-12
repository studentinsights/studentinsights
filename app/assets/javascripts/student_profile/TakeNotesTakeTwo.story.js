import React from 'react';
import {storiesOf} from '@storybook/react';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import TakeNotesTakeTwo from './TakeNotesTakeTwo';
import {currentEducator} from './fixtures/fixtures';


function storyProps(props = {}) {
  return {
    educator: currentEducator,
    student: {
      id: 42,
      first_name: 'Mari',
      last_name: 'Kenobi',
      grade: '9',
      house: 'Elm',
      school: {
        local_id: 'SHS',
        school_type: 'HS'
      },
      homeroom: null
    },
    ...props
  };
}

function storyRender(props, context) {
  const {districtKey} = context;
  return withDefaultNowContext(
    <div style={{display: 'flex', flexDirection: 'column', margin: 20, width: 470}}>
      <PerDistrictContainer districtKey={districtKey}>
        <TakeNotesTakeTwo {...props} />
      </PerDistrictContainer>
    </div>
  );
}

storiesOf('profile/TakeNotesTakeTwo', module) // eslint-disable-line no-undef
  .add('somerville', () => storyRender(storyProps(), {districtKey: 'somerville'}))
  .add('new_bedford', () => storyRender(storyProps(), {districtKey: 'new_bedford'}))
  .add('bedford', () => storyRender(storyProps(), {districtKey: 'bedford'}));
