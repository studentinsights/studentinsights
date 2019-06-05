import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import InsightFromBedfordTransition from './InsightFromBedfordTransition';

function testProps(props) {
  return {
    insightPayload: {
      insight_text: "She was really into basketball, and I went to one game early in the year and then kept asking her about it.  She's a shooting guard.",
      form_url: 'https://example.com/foo',
      educator: {
        id: 32,
        email: 'jess@demo.studentinsights.org',
        full_name: 'Educator, Jessica'
      }
    },
    student: {
      id: 42,
      first_name: 'Mari'
    },
    ...props
  };
}

// since element sizing methods aren't present in the Jest JS environment
jest.mock('../components/FitText', () => 'mocked-fit-text');

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<InsightFromBedfordTransition {...testProps()} />, el);
});

it('snapshots view', () => {
  const tree = renderer
    .create(<InsightFromBedfordTransition {...testProps()} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});