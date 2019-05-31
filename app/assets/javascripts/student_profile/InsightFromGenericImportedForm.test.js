import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../testing/NowContainer';
import InsightFromGenericImportedForm from './InsightFromGenericImportedForm';


function testProps(props = {}) {
  return {
    student: {
      id: 9,
      first_name: 'Mari',
      last_name: 'Kenobi'
    },
    insightPayload: {
      prompt_text: "At the end of the quarter 3, what would make you most proud of your accomplishments in your course?",
      response_text: "Keeping grades high in all classes since I'm worried about college",
      flattened_form_json: {
        form_title: 'Q2 Self-reflection',
        form_timestamp: '2018-03-06T11:03:00.000Z',
        text: '<the whole survey text>'
      }
    },
    ...props
  };
}

function testEl(props = {}) {
  return withDefaultNowContext(<InsightFromGenericImportedForm {...props} />);
}


// since element sizing methods aren't present in the Jest JS environment
jest.mock('../components/FitText', () => 'mocked-fit-text');

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(testEl(props), el);
});

it('snapshots view', () => {
  const props = testProps();
  const tree = renderer
    .create(testEl(props))
    .toJSON();
  expect(tree).toMatchSnapshot();
});
