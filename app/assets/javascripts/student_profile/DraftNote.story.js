import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import DraftNote from './DraftNote';
import {testProps} from './DraftNote.test';


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
  return withDefaultNowContext(
    <div style={{display: 'flex', flexDirection: 'column', margin: 20, width: 470}}>
      <PerDistrictContainer districtKey={districtKey}>
        <DraftNote {...props} />
      </PerDistrictContainer>
    </div>
  );
}

storiesOf('profile/DraftNote', module) // eslint-disable-line no-undef
  .add('somerville', () => storyRender(storyProps(), {districtKey: 'somerville'}))
  .add('new_bedford', () => storyRender(storyProps(), {districtKey: 'new_bedford'}))
  .add('bedford', () => storyRender(storyProps(), {districtKey: 'bedford'}));
