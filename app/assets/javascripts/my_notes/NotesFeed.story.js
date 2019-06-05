import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {testProps, testEl} from './NotesFeed.test';

function storyProps(props = {}) {
  return testProps({
    onClickLoadMoreNotes: action('onClickLoadMoreNotes'),
    ...props
  });
}

storiesOf('my_notes/NotesFeed', module) // eslint-disable-line no-undef
  .add('readonly, shows restricted note content', () => {
    return testEl(storyProps({canUserAccessRestrictedNotes: true}));
  });