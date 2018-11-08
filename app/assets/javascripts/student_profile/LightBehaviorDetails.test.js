import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import LightBehaviorDetails from './LightBehaviorDetails';
import {withDefaultNowContext} from '../testing/NowContainer';
import serviceTypesIndex from '../testing/fixtures/serviceTypesIndex';


function testProps(props = {}) {
  return {
    disciplineIncidents: testIncidents(),
    activeServices: [],
    canViewFullHistory: false,
    serviceTypesIndex,
    ...props
  };
}

function testIncidents() {
  const student = {
    "id": 42,
    "grade": "10",
    "first_name": "Mowgli",
    "last_name": "Pan",
    "house": "Beacon",
    "school": {
      "local_id": "SHS",
      "school_type": "HS"
    },
    "homeroom": {
      "id": 4,
      "name": "SHS ALL"
    }
  };
  
  return [{
    student,
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
    student,
    "id": 46,
    "incident_code": "XYZ",
    "created_at": "2016-02-22T14:22:11.437Z",
    "updated_at": "2016-02-22T14:22:11.437Z",
    "incident_location": "Classroom",
    "incident_description": "Something else happened a long time ago...",
    "occurred_at": "2016-02-24T08:10:11.543Z",
    "has_exact_time": true,
    "student_id": 42
  }];
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<LightBehaviorDetails {...props} />), el);
  return el;
}

it('renders empty data without crashing', () => {
  testRender(testProps());
});

it('renders clean slate note when cannot access', () => {
  const el = testRender(testProps());
  expect($(el).text()).toContain('talk with an administrator');
});

it('renders note to show full case history when access', () => {
  const el = testRender(testProps({canViewFullHistory: true}));
  expect($(el).text()).toContain('show full case history');
});

it('always hides older data by default', () => {
  const el = testRender(testProps({canViewFullHistory: true}));
  expect($(el).text()).toContain('A note about student privacy');
  expect($(el).html()).toContain('Something happened recently');
  expect($(el).html()).not.toContain('Something else happened a long time ago...');
  expect($(el).find('svg').length).toEqual(1);
  // test setup isn't working for highcharts contents
});

it('allows showing older data when access', () => {
  const el = testRender(testProps({canViewFullHistory: true}));
  expect($(el).text()).toContain('show full case history');
  ReactTestUtils.Simulate.click($(el).find('.CleanSlateMessage a').get(0));
  expect($(el).text()).toContain('hide full case history');
  expect($(el).html()).toContain('Something else happened a long time ago...');
});
