import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import {withDefaultNowContext} from '../testing/NowContainer';
import LightProfilePage, {latestStar} from './LightProfilePage';
import {
  testPropsForPlutoPoppins,
  testPropsForOlafWhite,
  testPropsForAladdinMouse
} from './StudentProfilePage.test';



it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testPropsForPlutoPoppins();
  ReactDOM.render(<LightProfilePage {...props} />, el);
});


describe('snapshots', () => {
  function expectSnapshot(props) {
    const tree = renderer
      .create(withDefaultNowContext(<LightProfilePage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  }

  it('works for olaf notes', () => expectSnapshot(testPropsForOlafWhite({selectedColumnKey: 'notes'})));
  it('works for olaf reading', () => expectSnapshot(testPropsForOlafWhite({selectedColumnKey: 'reading'})));
  it('works for olaf math', () => expectSnapshot(testPropsForOlafWhite({selectedColumnKey: 'math'})));

  it('works for pluto notes', () => expectSnapshot(testPropsForPlutoPoppins({selectedColumnKey: 'notes'})));
  it('works for pluto attendance', () => expectSnapshot(testPropsForPlutoPoppins({selectedColumnKey: 'attendance'})));
  it('works for pluto behavior', () => expectSnapshot(testPropsForPlutoPoppins({selectedColumnKey: 'behavior'})));

  it('works for aladdin notes', () => expectSnapshot(testPropsForAladdinMouse({selectedColumnKey: 'notes'})));
  it('works for aladdin grades', () => expectSnapshot(testPropsForAladdinMouse({selectedColumnKey: 'grades'})));
  it('works for aladdin testing', () => expectSnapshot(testPropsForAladdinMouse({selectedColumnKey: 'testing'})));
});


it('#latestStar', () => {
  const nowMoment = toMomentFromTimestamp('2018-08-13T11:03:06.123Z');
  const starSeriesReadingPercentile = [
    {"percentile_rank":98,"total_time":1134,"grade_equivalent":"6.90","date_taken":"2017-04-23T06:00:00.000Z"},
    {"percentile_rank":94,"total_time":1022,"grade_equivalent":"4.80","date_taken":"2017-01-07T02:00:00.000Z"}
  ];
  expect(latestStar(starSeriesReadingPercentile, nowMoment)).toEqual({
    nDaysText: '2 years ago',
    percentileText: '94th'
  });
});
