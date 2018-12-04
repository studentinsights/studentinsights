import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import FullCaseHistory from './FullCaseHistory';
import {testTimeMoment} from '../testing/NowContainer';
import {
  testPropsForPlutoPoppins,
  testPropsForOlafWhite,
  testPropsForAladdinMouse
} from './profileTestProps.fixture';

function testProps(props = {}) {
  return {
    nowMoment: testTimeMoment(),
    student: {
      first_name: 'Test',
      id: 42
    },
    attendanceData: {
      absences: [{id: 991, occurred_at: "2016-02-21T18:35:03.757Z"}],
      tardies: [{id: 998, occurred_at: "2014-01-01T14:35:03.750Z"}],
      discipline_incidents: [{id: 9912, occurred_at: "2012-01-10T14:35Z"}]
    },
    chartData: {
      mcas_series_ela_scaled: [[2015, 2, 18, 63]],
      mcas_series_math_scaled: [[2014, 9, 18, 23]],
      star_series_reading_percentile: [
        {id: 1, date_taken: '2016-01-18T00:00:00.000Z', percentile_rank: 83, grade_equivalent: '1.00'},
      ],
      star_series_math_percentile: [
        {id: 1, date_taken: '2012-11-18T00:00:00.000Z', percentile_rank: 43, grade_equivalent: '1.00'},
      ],
    },
    iepDocuments: [],
    services: [],
    feed: {
      deprecated: {
        interventions: [{id: 997, start_date_timestamp: "2010-10-1"}],
        notes: [{id: 945, created_at_timestamp: "2013-02-11T14:41:52.857Z"}]
      },
      event_notes: [{id: 992, recorded_at: "2010-10-17T00:00:00.000Z"}],
      services: {
        active: [{id: 996, date_started: "2010-02-09", service_type_id: 508}],
        discontinued: [{id: 945, date_started: "2010-10-08"}]
      }
    },
    dibels: [
      {id: 901, date_taken: "2012-05-15Z", benchmark: "STRATEGIC"}
    ],
    serviceTypesIndex: {
      "508": {name: "Math intervention", id: 508}
    },
    ...props
  };
}


it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(<FullCaseHistory {...props} />, el);
});


it('snapshots view', () => {
  const props = testProps();
  const tree = renderer
    .create(<FullCaseHistory {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});