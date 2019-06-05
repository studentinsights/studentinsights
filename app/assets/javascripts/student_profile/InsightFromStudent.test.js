import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import InsightFromStudent from './InsightFromStudent';

function testProps(props) {
  return {
    promptText: 'What are you excited about this year?',
    responseText: "I'm mostly looking forward to basketball season, we have a lot of good players this year.  And also graphic design, getting better at making digital art in Illustrator.",
    inWhatWhenEl: <span>in <b>Student voice survey</b></span>,
    student: {
      id: 42,
      first_name: 'Mari',
      last_name: 'Kenobi'
    },
    ...props
  };
}

// since element sizing methods aren't present in the Jest JS environment
jest.mock('../components/FitText', () => 'mocked-fit-text');

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<InsightFromStudent {...testProps()} />, el);
});

it('snapshots view', () => {
  const tree = renderer
    .create(<InsightFromStudent {...testProps()} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});