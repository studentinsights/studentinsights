import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import HorizontalStepper from './HorizontalStepper';
import {STEPS} from './ClassListCreatorPage';

storiesOf('equity/HorizontalStepper', module) // eslint-disable-line no-undef
  .add('normal', () => {
    return (
      <HorizontalStepper
        availableSteps={STEPS.map((step, index) => index)}
        steps={STEPS}
        stepIndex={2}
        onStepChanged={action('onStepChanged')}
        renderFn={(stepIndex, step) => <div style={{border: '1px solid #eee', padding: 20}}>contents for {step}</div>} />
    );
  });