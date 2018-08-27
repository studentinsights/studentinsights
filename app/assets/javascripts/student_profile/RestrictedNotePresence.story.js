import React from 'react';
import {storiesOf} from '@storybook/react';
import RestrictedNotePresence from './RestrictedNotePresence';
import {testProps, mockFetch} from './RestrictedNotePresence.test';

function storyRender(props) {
  return (
    <div style={{width: 400}}>
      <RestrictedNotePresence {...props} />
    </div>
  );
}

storiesOf('profile-v3/RestrictedNotePresence', module) // eslint-disable-line no-undef
  .add('default', () => storyRender(testProps()))
  .add('allowViewing', () => {
    mockFetch();
    return storyRender(testProps({allowViewing: true}));
  });