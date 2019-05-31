import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../testing/NowContainer';
import TransitionNotesBox from './TransitionNotesBox';


function renderIntoEl(element) {
  const el = document.createElement('div');
  ReactDOM.render(element, el);
  return el;
}

function testProps(props) {
  return {
    educatorLabels: [],
    style: {
      color: 'red'
    },
    titleStyle: {
      color: 'purple'
    },
    ...props
  };
}

function testEl(props) {
  return withDefaultNowContext(<TransitionNotesBox {...props} />);
}

it('renders without crashing', () => {
  const props = testProps();
  renderIntoEl(testEl(props));
});

it('renders nothing if label not set', () => {
  const props = testProps();
  const el = renderIntoEl(testEl(props));
  expect($(el).text()).toEqual('');
});

it('snapshots if label is set', () => {
  const props = testProps({
    educatorLabels: ['enable_transition_note_features']
  });
  const tree = renderer
    .create(testEl(props))
    .toJSON();
  expect(tree).toMatchSnapshot();
});
