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
      '2018-winter': { stats: { p: 20 } },
      '2018-spring': { stats: { p: 35 } },
      '2019-fall': { stats: { p: 45 } },
      '2019-winter': { stats: { p: 41 } }
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
