import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {testProps, testEl} from './LitSidebarDialog.test';

function storyProps(props = {}) {
  return {
    ...testProps(),
    onClose: action('onClose'),
    ...props
  };
}

storiesOf('reading/LitSidebarDialog', module) // eslint-disable-line no-undef
  .add('normal', () => testEl(storyProps()));