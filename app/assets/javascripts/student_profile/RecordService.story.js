import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import RecordService from './RecordService';
import {testProps} from './RecordService.test';

function storyProps(props = {}) {
  return {
    ...testProps(),
    onSave: action('onSave'),
    onCancel: action('onCancel'),
    ...props
  };
}

storiesOf('profile/RecordService', module) // eslint-disable-line no-undef
  .add('normal', () => <RecordService {...storyProps()} />);

