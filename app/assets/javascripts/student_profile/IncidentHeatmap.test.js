import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../testing/NowContainer';
import IncidentHeatmap from './IncidentHeatmap';

function testProps() {

  return { incidents: [{
    "id": 45,
    "incident_code": "ABC",
    "created_at": "2018-03-01T14:22:11.437Z",
    "updated_at": "2018-03-01T14:22:11.437Z",
    "incident_location": "Classroom",
    "incident_description": "Something happened recently.",
    "occurred_at": "2018-03-02T08:22:11.437Z",
    "has_exact_time": true,
    "student_id": 42
  }, {
    "id": 46,
    "incident_code": "XYZ",
    "created_at": "2016-02-22T14:22:11.437Z",
    "updated_at": "2016-02-22T14:22:11.437Z",
    "incident_location": "Classroom",
    "incident_description": "Something else happened a long time ago...",
    "occurred_at": "2016-02-24T08:10:11.543Z",
    "has_exact_time": true,
    "student_id": 42
  }]};
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<IncidentHeatmap {...props} />), el);
  return el;
}

jest.mock('../components/HighchartsWrapper', () => 'highcharts-wrapper');

it('renders without crashing', () => {
  testRender(testProps());
});
