import React from 'react';
import {storiesOf} from '@storybook/react';
import HorizontalStepper from './HorizontalStepper';

storiesOf('equity/HorizontalStepper', module) // eslint-disable-line no-undef
  .add('normal', () => {
    return (
      <HorizontalStepper
        defaultStepIndex={2}
        steps={[
          'Choose your grade',
          'Make a plan',
          'Create your classrooms',
          'Review and share notes',
          'Share with your principal'
        ]}
        renderFn={(stepIndex, step) => <div style={{border: '1px solid #eee', padding: 20}}>contents for {step}</div>} />
    );
  });