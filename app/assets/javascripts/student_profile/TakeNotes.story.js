import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import PerDistrictContainer from '../components/PerDistrictContainer';
import TakeNotes from './TakeNotes';
import {testProps} from './TakeNotes.test';


function storyProps(props = {}) {
  return {
    ...testProps(),
    onSave: action('onSave'),
    onCancel: action('onCancel'),
    onClickNoteType: action('onClickNoteType'),
    onChangeNoteInProgressText: action('onChangeNoteInProgressText'),
    onChangeAttachmentUrl: action('onChangeAttachmentUrl'),
    ...props
  };
}

function storyRender(props, context) {
  const {districtKey} = context;
  return (
    <div style={{display: 'flex', flexDirection: 'column', margin: 20, width: 470}}>
      <PerDistrictContainer districtKey={districtKey}>
        <TakeNotes {...props} />
      </PerDistrictContainer>
    </div>
  );
}

storiesOf('profile/TakeNotes', module) // eslint-disable-line no-undef
  .add('somerville', () => storyRender(storyProps(), {districtKey: 'somerville'}))
  .add('new_bedford', () => storyRender(storyProps(), {districtKey: 'new_bedford'}));
