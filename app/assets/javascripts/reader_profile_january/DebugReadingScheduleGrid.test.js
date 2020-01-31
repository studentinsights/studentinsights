import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import DebugReadingScheduleGrid from './DebugReadingScheduleGrid';


const TEST_NOW_STRING = '2020-01-03T14:36:34.501Z';

// this test data is only correct shape, but not semantically meaningful
export function testProps(props = {}) {
  return {
    gradeNow: '1',
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

// simulate this to test the full render
export function testRender(props = {}) {
  return withNowContext(TEST_NOW_STRING,
    <PerDistrictContainer districtKey="somerville">
      <DebugReadingScheduleGrid {...props} />
    </PerDistrictContainer>
  );
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(testRender(testProps()), el);
});


it('snapshots', () => {
  const tree = renderer.create(testRender(testProps())).toJSON();
  expect(tree).toMatchSnapshot();
});


const firstGradeWinter = [
  {
    "id": 132,
    "student_id": 24,
    "benchmark_school_year": 2019,
    "benchmark_period_key": "winter",
    "benchmark_assessment_key": "f_and_p_english",
    "json": {
      "value": "L"
    },
    "educator_id": 1,
    "created_at": "2019-12-02T14:36:34.523Z",
    "updated_at": "2019-12-02T14:36:34.523Z"
  },
  {
    "id": 131,
    "student_id": 24,
    "benchmark_school_year": 2019,
    "benchmark_period_key": "fall",
    "benchmark_assessment_key": "f_and_p_english",
    "json": {
      "value": "F"
    },
    "educator_id": 1,
    "created_at": "2019-12-02T14:36:34.518Z",
    "updated_at": "2019-12-02T14:36:34.518Z"
  },
  {
    "id": 130,
    "student_id": 24,
    "benchmark_school_year": 2018,
    "benchmark_period_key": "spring",
    "benchmark_assessment_key": "f_and_p_english",
    "json": {
      "value": "E"
    },
    "educator_id": 1,
    "created_at": "2019-12-02T14:36:34.514Z",
    "updated_at": "2019-12-02T14:36:34.514Z"
  },
  {
    "id": 130,
    "student_id": 24,
    "benchmark_school_year": 2018,
    "benchmark_period_key": "winter",
    "benchmark_assessment_key": "f_and_p_english",
    "json": {
      "value": "B"
    },
    "educator_id": 1,
    "created_at": "2019-12-02T14:36:34.514Z",
    "updated_at": "2019-12-02T14:36:34.514Z"
  },
  {
    "id": 129,
    "student_id": 24,
    "benchmark_school_year": 2018,
    "benchmark_period_key": "fall",
    "benchmark_assessment_key": "f_and_p_english",
    "json": {
      "value": "AA"
    },
    "educator_id": 1,
    "created_at": "2019-12-02T14:36:34.510Z",
    "updated_at": "2019-12-02T14:36:34.510Z"
  }
];