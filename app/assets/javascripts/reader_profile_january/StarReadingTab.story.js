import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {testProps, testRender} from './StarReadingTab.test';


function storyProps(props = {}) {
  return {
    ...testProps(),
    onClick: action('onClick'),
    ...props
  };
}


storiesOf('reader_profile_january/StarReadingTab', module) // eslint-disable-line no-undef
  .add('default', () => testRender(storyProps()));