import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import MakePlan from './MakePlan';
import {testProps} from './MakePlan.test';

function storyProps(props = {}) {
  return {
    ...testProps(),
    onPlanChanged: action('onPlanChanged'),
    onDone: action('onDone'),
    ...props
  };
}

storiesOf('reading/MakePlan', module) // eslint-disable-line no-undef
  .add('normal', () => <MakePlan {...storyProps()} />);