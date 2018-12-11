import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import NotesFeed from './NotesFeed';
import {testProps} from './NotesFeed.test';

function storyProps(props = {}) {
  return testProps({
    onClickLoadMoreNotes: action('onClickLoadMoreNotes'),
    ...props
  });
}

storiesOf('my_notes/NotesFeed', module) // eslint-disable-line no-undef
  .add('readonly, shows restricted note content', () => {
    return <NotesFeed {...storyProps({canUserAccessRestrictedNotes: true})} />;
  });