import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import HorizontalStepper from './HorizontalStepper';
import {testProps} from './HorizontalStepper.test';


storiesOf('classlists/HorizontalStepper', module) // eslint-disable-line no-undef
  .add('writer', () => {
    const props = testProps({
      onStepChanged: action('onStepChanged')
    });
    return <HorizontalStepper {...props} />;
  })
  .add('readonly', () => {
    const props = testProps({
      isEditable: false,
      onStepChanged: action('onStepChanged')
    });
    return <HorizontalStepper {...props} />;
  });