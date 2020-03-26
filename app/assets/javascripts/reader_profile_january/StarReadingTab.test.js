import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import StarReadingTab from './StarReadingTab';


// in spring of KF, looking back at fall and winter scores
const TEST_NOW_STRING = '2018-05-15T11:03:06.123Z';

export function testProps(props = {}) {
  return {
    onClick: jest.fn(),
    student: {
      id: 123,
      first_name: 'Amir',
      grade: '3'
    },
    readerJson: {
      access: {},
      services: [],
      iep_contents: null,
      feed_cards: [],
      current_school_year: 2017,
      reading_chart_data: {
        star_series_reading_percentile: [{
          "percentile_rank": 40,
          "total_time": 1569,
          "grade_equivalent": "2.80",
          "date_taken": "2017-10-13T00:00:00.000Z"
        }, {
          "percentile_rank": 29,
          "total_time": 1178,
          "grade_equivalent": "2.25",
          "date_taken": "2017-05-11T00:00:00.000Z"
        }]
      },
      benchmark_data_points: []
    },
    ...props
  };
}

export function testRender(props = {}) {
  return (
    withNowContext(TEST_NOW_STRING, (
      <PerDistrictContainer districtKey="somerville">
        <StarReadingTab {...props} />
      </PerDistrictContainer>
    ))
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
