import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import NotesFeedPage from './NotesFeedPage';
import {testProps} from './NotesFeedPage.test';

function storyProps(props = {}) {
  return testProps({
    onClickLoadMoreNotes: action('onClickLoadMoreNotes'),
    ...props
  });
}

storiesOf('notes_feed/NotesFeedPage', module) // eslint-disable-line no-undef
  .add('readonly, shows restricted note content', () => <NotesFeedPage {...storyProps()} />);