import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
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

storiesOf('profile/TakeNotes', module) // eslint-disable-line no-undef
  .add('all', () => (
    <div style={{display: 'flex', flexDirection: 'column', margin: 20, width: 470}}>
      <TakeNotes {...storyProps()} />
    </div>
  ));
