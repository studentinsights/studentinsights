import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import HighchartsWrapper from '../components/HighchartsWrapper';
import {xAxisWithGrades} from './highchartsXAxisWithGrades';
import {lineChartOptions} from './highchartsLineChart';
import {yAxisPercentileOptions} from './highchartsYAxisPercentileOptions';

// STAR charts on profile page
export default class StarChart extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {studentGrade, starSeries} = this.props;

    const props = {
      ...lineChartOptions(),
      series: [{
        name: 'Percentile rank',
        data: toDataPoints(starSeries)
      }],
      xAxis: xAxisWithGrades(studentGrade, nowFn()),
      yAxis: {
        ...yAxisPercentileOptions(),
        title: {
          text: 'Percentile rank'
        }
      },
      tooltip: starChartTooltip(),
    };

    return (
      <div className="StarChart">
        <HighchartsWrapper {...props} />
      </div>
    );
  }
}
StarChart.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
StarChart.propTypes = {
  starSeries: PropTypes.array.isRequired, // [year, month, date, value] quads
  studentGrade: PropTypes.string.isRequired,
  timestampRange: PropTypes.shape({
    min: PropTypes.number,
    max: PropTypes.number
  })
};


function toDataPoints(starSeries) {
  const dataPoints = (starSeries || []).map(starJson => {
    return {
      x: toMomentFromTimestamp(starJson.date_taken).valueOf(),
      y: starJson.percentile_rank,
      gradeLevelEquivalent: starJson.grade_equivalent,
      totalTime: starJson.total_time,
    };
  });

  // HighCharts wants time series data sorted in ascending x order
  return _.sortBy(dataPoints, 'x');
}


// For showing all the details on hover
export function starChartTooltip() {
  return {
    formatter() {
      const dateTaken = moment(new Date(this.x));
      const formattedDate = dateTaken.local().format('MMMM Do YYYY, h:mm:ss a');

      const percentileRank = this.y;
      const formattedPercentileRank = `<br/>Percentile Rank: <b>${percentileRank}</b>`;

      const gradeLevelEquivalent = this.points[0].point.gradeLevelEquivalent;
      const formattedGradeEquivalent = `<br>Grade Level Equivalent: <b>${gradeLevelEquivalent}</b>`;

      const totalTime = this.points[0].point.totalTime;
      const duration = humanizeStarTotalTime(totalTime, 'seconds');
      const formattedTotalTime = `<br>Time Taking Test: <b>${duration}</b>`;

      return [
        formattedDate,
        formattedPercentileRank,
        formattedTotalTime,
        formattedGradeEquivalent,
      ].join('');
    },
    shared: true
  };
}

// This is meant as a more precise alternative to moment.humanize(). It's geared
// to STAR total time values, which are mostly in minutes. (The average STAR
// total_time for Somerville is 23 minutes and 20 seconds.)
// See https://github.com/moment/moment/issues/348 for more on problems with
// lack of precision in moment.humanize().
function humanizeStarTotalTime (seconds) {
  if (seconds < 60) return `${seconds} seconds`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes} minutes and ${remainingSeconds} seconds`;
}
