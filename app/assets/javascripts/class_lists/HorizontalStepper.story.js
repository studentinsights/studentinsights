import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import HorizontalStepper from './HorizontalStepper';
import {testProps} from './HorizontalStepper.test';

function storyProps(props = {}) {
  return {
    ...testProps(),
    onStepChanged: action('onStepChanged'),
    ...props
  };
}

storiesOf('classlists/HorizontalStepper', module) // eslint-disable-line no-undef
  .add('writer', () => {
    const props = storyProps();
    return <HorizontalStepper {...props} />;
  })
  .add('readonly', () => {
    const props = storyProps({ isEditable: false });
    return <HorizontalStepper {...props} />;
  })
  .add('revisable', () => {
    const props = storyProps({ isEditable: false, isRevisable: true });
    return <HorizontalStepper {...props} />;
  });