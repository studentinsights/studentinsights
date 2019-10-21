import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import LightBehaviorDetails from './LightBehaviorDetails';
import withDefaultTestContext from '../testing/withDefaultTestContext';
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

function testRender(props, context = {}) {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultTestContext(<LightBehaviorDetails {...props} />, context), el);
  return el;
}

// Read them from the mocked component
function parseHighchartPlotLineLabelsForDisciplineChart(el) {
  const json = $(el).find('#disciplineChart .Mocked-HighchartsWrapper').text();
  const highchartOptions = JSON.parse(json);
  return highchartOptions.xAxis[0].plotLines.map(plotLine => plotLine.label.text);
}

// KR: I couldn't get assertions working to verify that HighCharts
// draws this on the page, even with delay or trying to explicitly
// set sizing on DOM element containers; this clearly works as expected
// in dev, story and production, so punting for now by mocking the module
// and serializing some props for simpler assertions.
jest.mock('../components/HighchartsWrapper', () =>
  props => <pre className="Mocked-HighchartsWrapper">{JSON.stringify(props)}</pre> // eslint-disable-line react/display-name
);


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
  expect($(el).find('.Mocked-HighchartsWrapper').length).toEqual(2); // test setup isn't working for full highcharts content
  expect($(el).find('.DisciplineScatterPlot').length).toEqual(1);
});

it('allows showing older data when access', () => {
  const el = testRender(testProps({canViewFullHistory: true}));
  expect($(el).text()).toContain('show full case history');
  ReactTestUtils.Simulate.click($(el).find('.CleanSlateMessage a').get(0));
  expect($(el).text()).toContain('hide full case history');
  expect($(el).html()).toContain('Something else happened a long time ago...');
});

it('can pass props propertly to draw phaselines for relevant services', () => {
  const activeServices = [{
    service_type_id: 502,
    date_started: '2018-02-18T07:22:11.123Z'
  }];
  const el = testRender(testProps({activeServices}));
  expect(parseHighchartPlotLineLabelsForDisciplineChart(el)).toEqual([
    'Started Attendance Officer',
    'Only one year of data is shown to respect privacy'
  ]);
});

it('ignores services if not included in nonAcademicServiceTypeIdsForPhaselines', () => {
  const activeServices = [{
    service_type_id: 707, // not relevant
    date_started: '2018-02-18T07:22:11.123Z'
  }, {
    service_type_id: 709, // include
    date_started: '2018-01-11T07:22:11.123Z'
  }];
  const el = testRender(testProps({activeServices}), {districtKey: 'bedford'});
  expect(parseHighchartPlotLineLabelsForDisciplineChart(el)).toEqual([
    'Started Formal Behavior Plan',
    'Only one year of data is shown to respect privacy'
  ]);
});