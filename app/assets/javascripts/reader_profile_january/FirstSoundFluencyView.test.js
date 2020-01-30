import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import FirstSoundFluencyView from './FirstSoundFluencyView';
import {readInstructionalStrategies} from './instructionalStrategies';


// in spring of KF, looking back at fall and winter scores
const TEST_NOW_STRING = '2018-05-15T11:03:06.123Z';

export function testProps(props = {}) {
  return {
    onClose: jest.fn(),
    student: {
      id: 123,
      first_name: 'Max',
      grade: 'KF'
    },
    readerJson: {
      access: {},
      services: [],
      iep_contents: null,
      feed_cards: [],
      current_school_year: 2017,
      benchmark_data_points: [{
        "id": 1001,
        "student_id": 123,
        "benchmark_school_year": 2017,
        "benchmark_period_key": 'fall',
        "benchmark_assessment_key": "dibels_fsf",
        "json": {
          "value": 12
        },
        "educator_id": 999999,
        "created_at": "2017-09-22T19:27:10.429Z",
        "updated_at": "2017-09-22T19:27:10.429Z"
      }, {
        "id": 1002,
        "student_id": 123,
        "benchmark_school_year": 2017,
        "benchmark_period_key": 'winter',
        "benchmark_assessment_key": "dibels_fsf",
        "json": {
          "value": 36
        },
        "educator_id": 999999,
        "created_at": "2018-01-25T19:27:10.429Z",
        "updated_at": "2018-01-25T19:27:10.429Z"
      }]
    },
    instructionalStrategies: readInstructionalStrategies(),
    ...props
  };
}

export function testRender(props = {}) {
  return (
    withNowContext(TEST_NOW_STRING, (
      <PerDistrictContainer districtKey="somerville">
        <FirstSoundFluencyView {...props} />
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
