import React from 'react';
import ReactDOM from 'react-dom';
import {withNowContext} from '../testing/NowContainer';
import {expectSnapshotToMatchAfterTick} from '../testing/snapshotAsync';
import fetchMock from 'fetch-mock/es5/client';
import PerDistrictContainer from '../components/PerDistrictContainer';
import {firstGradeWinter} from './BoxChart.fixture.js';
import CohortChart from './CohortChart';

beforeEach(mockFetch);

export function mockFetch() {
  fetchMock.restore();
  fetchMock.get('express:/api/students/:student_id/reader_profile_cohort_json', {
    cells: {
      '2018-winter': { value: 101, stats: { p: 20, n_lower: 1, n_equal: 0, n_higher: 4 } },
      '2018-spring': { value: 101, stats: { p: 40, n_lower: 2, n_equal: 0, n_higher: 3 } },
      '2019-fall':   { value: 132, stats: { p: 60, n_lower: 2, n_equal: 2, n_higher: 1 } },
      '2019-winter': { value: 132, stats: { p: 40, n_lower: 2, n_equal: 0, n_higher: 3 } },
    }
  });
}

export function testProps(props = {}) {
  return {
    studentId: 42,
    gradeNow: '1',
    benchmarkAssessmentKey: 'f_and_p_english',
    readerJson: {
      access: {},
      services: [],
      iep_contents: null,
      feed_cards: [],
      "current_school_year": 2019,
      "benchmark_data_points": firstGradeWinter
    },
    ...props
  };
}

export function testRender(props = {}) {
  return withNowContext('2020-01-03T14:36:34.501Z',
    <PerDistrictContainer districtKey="somerville">
      <CohortChart {...props} />
    </PerDistrictContainer>
  );
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(testRender(testProps()), el);
});


it('snapshots', done => {
  expectSnapshotToMatchAfterTick(testRender(testProps()), done);
});
