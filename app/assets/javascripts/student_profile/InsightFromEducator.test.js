import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import InsightFromEducator from './InsightFromEducator';

function testProps(props) {
  return {
    promptText: 'What worked well for connecting with Mari?',
    responseText: "She was really into basketball, and I went to one game early in the year and then kept asking her about it.  She's a shooting guard.",
    inWhatWhenEl: <span>in <b>Transition note</b></span>,
    educator: {
      id: 32,
      email: 'edgar@demo.studentinsights.org',
      full_name: 'Teacher, Edgar'
    },
    ...props
  };
}

// since element sizing methods aren't present in the Jest JS environment
jest.mock('../components/FitText', () => 'mocked-fit-text');

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<InsightFromEducator {...testProps()} />, el);
});

it('snapshots view', () => {
  const tree = renderer
    .create(<InsightFromEducator {...testProps()} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});