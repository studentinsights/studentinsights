import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {testProps, testEl} from './SidebarDialog.test';

function storyProps(props = {}) {
  return {
    ...testProps(),
    onClose: action('onClose'),
    ...props
  };
}

storiesOf('reading/SidebarDialog', module) // eslint-disable-line no-undef
  .add('normal', () => testEl(storyProps()));