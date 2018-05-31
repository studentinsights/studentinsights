import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import HorizontalStepper from './HorizontalStepper';
import {STEPS} from './ClassListCreatorPage';

export function testProps(props = {}) {
  return {
    availableSteps: STEPS.map((step, index) => index),
    steps: STEPS,
    stepIndex: 2,
    isEditable: true,
    isDirty: false,
    onStepChanged: jest.fn(),
    renderFn(stepIndex, step) {
      return <div style={{border: '1px solid #eee', padding: 20}}>contents for {step}</div>;
    },
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(<HorizontalStepper {...props} />, el);
});

it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(<HorizontalStepper {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('snapshots when readonly', () => {
  const props = testProps({ isEditable: false });
  const tree = renderer
    .create(<HorizontalStepper {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});