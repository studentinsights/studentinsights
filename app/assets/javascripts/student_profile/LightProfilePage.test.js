import {toMomentFromTimestamp} from '../helpers/toMoment';
import {latestStar} from './LightProfilePage';


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
