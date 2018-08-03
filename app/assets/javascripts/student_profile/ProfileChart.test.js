import _ from 'lodash';
import moment from 'moment';
import ProfileChart from './ProfileChart';

describe('#timeProps', () => {
  const {timestampRange} = ProfileChart.prototype.timeProps.call({ props: {} });
  expect(timestampRange.min).toBeLessThan(timestampRange.max);
});

describe('#getSchoolYearStartPositions', () => {
  it('works when current grade is 5', () => {
    expect(
          ProfileChart.prototype.getSchoolYearStartPositions(24, moment.utc("2016-09-10"), 5)
      ).toEqual(
          _.fromPairs([
              [moment.utc("2016-08-15").valueOf(), "<b>Grade 5<br>started</b>"],
              [moment.utc("2015-08-15").valueOf(), "<b>Grade 4<br>started</b>"],
              [moment.utc("2014-08-15").valueOf(), "<b>Grade 3<br>started</b>"]
          ])
      );
  }),

  it('works when current grade is 1', () => {
    expect(
          ProfileChart.prototype.getSchoolYearStartPositions(24, moment.utc("2016-09-10"), 1)
      ).toEqual(
          _.fromPairs([
              [moment.utc("2016-08-15").valueOf(), "<b>Grade 1<br>started</b>"],
              [moment.utc("2015-08-15").valueOf(), "<b>Grade KF<br>started</b>"],
              [moment.utc("2014-08-15").valueOf(), ""]
          ])
      );
  });
});
