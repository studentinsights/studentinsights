import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {merge} from '../helpers/merge';
import HighchartsWrapper from './HighchartsWrapper';
import ProfileChartSettings from './ProfileChartSettings';
import {
  schoolYearStartDates,
  toPair,
  toStarObject
} from './QuadConverter';


// Component for all charts in the profile page.
export default class ProfileChart extends React.Component {

  constructor(props) {
    super(props); 
  }

  timeProps() {
    const nowMoment = moment.utc();
    // The intent of fixing this date range is that when staff are looking at profile of different students,
    // the scales are consistent (and not changing between 3 mos and 6 years depending on the student's record,
    // since that's easy to miss and misinterpret.
    const intervalBack = [4, 'years'];

    return {
      nowMoment,
      intervalBack: intervalBack,
      timestampRange: this.props.timestampRange || {
        min: nowMoment.clone().subtract(4, 'years').toDate().getTime(),
        max: nowMoment.toDate().getTime(),
      }
    };
  }

  getSchoolYearStartPositions(n, now, current_grade){
    // Takes in an integer (number of months back), the current date
    // as a Moment object (UTC), and the student's current grade.
    // Returns an object mapping:
    // integer (timestamp) --> string (school year starting at that position).

    const range = [now.clone().subtract(n, 'months'), now];
    const startDates = schoolYearStartDates(range);
    const create_label = function(current, grade){
      // Assumes that the student progressed grades in the usual fashion;
      // wasn't held back or skipped forward.
      // John Breslin says these events are very rare.

      // Handle grade before 1st grade
      if (grade === 0) grade = 'KF';

      // No label for "negative" grades
      if (grade < 0) return '';

      return _.template("<b>Grade <%=grade%><br>started</b>")({
        year: current.year(),
        grade: grade
      });
    };

    return _.object(
      startDates.map(function(date){ return date.valueOf(); }),
      startDates.map(function(date, i){
        return create_label(
          date,
          (current_grade - startDates.length) + (i + 1) // (current_grade - n/12) to current_grade inclusive
        );
      })
    );
  }

  baseOptions() {
    if (this.props.student.grade === 'KF') {
      return ProfileChartSettings.base_options;
    } else if (this.props.showGradeLevelEquivalent === true) {
      return  this.baseOptionsForStar();
    } else {
      return this.baseOptionsForNonKF();
    }
  }

  baseOptionsForStar () {
    const {nowMoment, timestampRange} = this.timeProps();
    const positionsForYearStarts = this.getSchoolYearStartPositions(
      48, nowMoment, parseInt(this.props.student.grade)
    );

    return merge(ProfileChartSettings.star_chart_base_options, {
      xAxis: [
        merge(ProfileChartSettings.x_axis_datetime, {
          plotLines: this.x_axis_bands,
          min: timestampRange.min,
          max: timestampRange.max
        }),
        {
          type: "datetime",
          offset: 35,
          linkedTo: 0,
          tickPositions: _.keys(positionsForYearStarts).map(Number),
          categories: positionsForYearStarts,
        }
      ]
    });
  }

  baseOptionsForNonKF () {
    const {nowMoment, timestampRange} = this.timeProps();
    const positionsForYearStarts = this.getSchoolYearStartPositions(
      48, nowMoment, parseInt(this.props.student.grade)
    );

    return merge(ProfileChartSettings.base_options, {
      xAxis: [
        merge(ProfileChartSettings.x_axis_datetime, {
          plotLines: this.x_axis_bands,
          min: timestampRange.min,
          max: timestampRange.max
        }),
        {
          type: "datetime",
          offset: 35,
          linkedTo: 0,
          tickPositions: _.keys(positionsForYearStarts).map(Number),
          categories: positionsForYearStarts,
        }
      ]
    });
  }

  render() {
    return (
      <div>
        {this.renderHighchartsWrapper()}
      </div>
    );
  }

  renderHighchartsWrapper() {
    if (this.props.showGradeLevelEquivalent === true) {
      return this.renderStarHighchartsWrapper();
    } else {
      return this.renderNonStarHighchartsWrapper();
    }
  }

  renderNonStarHighchartsWrapper() {
    return (
      <HighchartsWrapper
        {...merge(this.baseOptions(), {
          series: this.props.quadSeries.map(function(obj){
            return {
              name: obj.name,
              data: obj.data ? _.map(obj.data, toPair): []
            };
          }),
          yAxis: this.props.yAxis
        })} />
    );
  }

  renderStarHighchartsWrapper() {
    return (
      <HighchartsWrapper
        {...merge(this.baseOptions(), {
          series: this.props.quadSeries.map(function(obj){
            return {
              name: obj.name,
              data: obj.data  ? _.map(obj.data, toStarObject): []
            };
          }),
          yAxis: this.props.yAxis
        })} />
    );
  }

}

ProfileChart.propTypes = {
  showGradeLevelEquivalent: PropTypes.bool,
  quadSeries: PropTypes.arrayOf( // you can plot multiple series on the same graph
    PropTypes.shape({
      name: PropTypes.string.isRequired, // e.g. 'Scaled score'
      data: PropTypes.array.isRequired // [year, month, date, value] quads
    })
  ),
  titleText: PropTypes.string.isRequired, // e.g. 'MCAS scores, last 4 years'
  yAxis: PropTypes.object.isRequired, // options for rendering the y-axis
  student: PropTypes.object.isRequired,
  timestampRange: PropTypes.shape({
    min: PropTypes.number,
    max: PropTypes.number
  })
};
