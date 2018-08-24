import React from 'react';
import {storiesOf} from '@storybook/react';
import NotesFeedPage from './NotesFeedPage';
import {testProps} from './NotesFeedPage.test';

storiesOf('notes_feed/NotesFeedPage', module) // eslint-disable-line no-undef
  .add('readonly, shows restricted note content', () => <NotesFeedPage {...testProps()} />);