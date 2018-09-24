import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../testing/NowContainer';
import AccessPanel from './AccessPanel';

function testProps(props = {}) {
  return {
    "access": {
      "composite": {
        "performance_level": "4",
        "date_taken": "2017-09-24T11:03:06.123Z"
      },
      "comprehension": null,
      "literacy": null,
      "oral": null,
      "listening": null,
      "reading": null,
      "speaking": null,
      "writing": null
    }
  };
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<AccessPanel {...props} />), el);
  return el;
}

it('renders without crashing', () => {
  testRender(testProps());
});

describe('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(withDefaultNowContext(<AccessPanel {...props} />))
    .toJSON();
  expect(tree).toMatchSnapshot();
});