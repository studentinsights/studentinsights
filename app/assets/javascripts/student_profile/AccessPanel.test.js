import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import AccessPanel from './AccessPanel';

export function testProps(props = {}) {
  return {
    "studentFirstName": "Mari",
    "access": {
      "composite": {
        "performance_level": "4",
        "date_taken": "2017-09-24T11:03:06.123Z"
      },
      "comprehension": {
        "performance_level": "3.1",
        "date_taken": "2017-09-12T11:03:06.123Z"
      },
      "literacy": {
        "performance_level": "3.6",
        "date_taken": "2017-09-12T11:03:06.123Z"
      },
      "oral": {
        "performance_level": "5.1",
        "date_taken": "2017-09-24T11:03:06.123Z"
      },
      "listening": {
        "performance_level": "4",
        "date_taken": "2017-09-24T11:03:06.123Z"
      },
      "reading": {
        "performance_level": "4.8",
        "date_taken": "2017-09-12T11:03:06.123Z"
      },
      "speaking": {
        "performance_level": "4",
        "date_taken": "2017-09-24T11:03:06.123Z"
      },
      "writing": {
        "performance_level": "5.3",
        "date_taken": "2017-09-12T11:03:06.123Z"
      },
    }
  };
}

function testEl(props, context = {}) {
  const districtKey = context.districtKey || 'somerville';
  return withDefaultNowContext(
    <PerDistrictContainer districtKey={districtKey}>
      <AccessPanel {...props} />
    </PerDistrictContainer>
  );
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el);
  return el;
}

it('renders without crashing', () => {
  testRender(testProps());
});

it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(testEl(props))
    .toJSON();
  expect(tree).toMatchSnapshot();
});