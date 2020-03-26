import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {testProps, testRender} from './StarReadingView.test';


function storyProps(props = {}) {
  return {
    ...testProps(),
    onClose: action('onClose'),
    ...props
  };
}


storiesOf('reader_profile_january/StarReadingView', module) // eslint-disable-line no-undef
  .add('default', () => testRender(storyProps()));