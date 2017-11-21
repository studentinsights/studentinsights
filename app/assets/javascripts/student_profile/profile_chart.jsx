import _ from 'lodash';
import {merge} from '../helpers/react_helpers.jsx';

(function() {
  window.shared || (window.shared = {});
  const QuadConverter = window.shared.QuadConverter;

  const ProfileChartSettings = window.ProfileChartSettings;
  const HighchartsWrapper = window.shared.HighchartsWrapper;

  // Component for all charts in the profile page.
  window.shared.ProfileChart = React.createClass({
    displayName: 'ProfileChart',

    propTypes: {
      showGradeLevelEquivalent: React.PropTypes.bool,
      quadSeries: React.PropTypes.arrayOf( // you can plot multiple series on the same graph
        React.PropTypes.shape({
          name: React.PropTypes.string.isRequired, // e.g. 'Scaled score'
          data: React.PropTypes.array.isRequired // [year, month, date, value] quads
        })
      ),
      titleText: React.PropTypes.string.isRequired, // e.g. 'MCAS scores, last 4 years'
      yAxis: React.PropTypes.object.isRequired, // options for rendering the y-axis
      student: React.PropTypes.object.isRequired,
      timestampRange: React.PropTypes.shape({
        min: React.PropTypes.number,
        max: React.PropTypes.number
      })
    },

    timeProps: function() {
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
    },

    getSchoolYearStartPositions: function(n, now, current_grade){
      // Takes in an integer (number of months back), the current date
      // as a Moment object (UTC), and the student's current grade.
      // Returns an object mapping:
      // integer (timestamp) --> string (school year starting at that position).

      const range = [now.clone().subtract(n, 'months'), now];
      const startDates = QuadConverter.schoolYearStartDates(range);
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
    },

    baseOptions: function() {
      if (this.props.student.grade === 'KF') {
        return ProfileChartSettings.base_options;
      } else if (this.props.showGradeLevelEquivalent === true) {
        return  this.baseOptionsForStar();
      } else {
        return this.baseOptionsForNonKF();
      }
    },

    baseOptionsForStar: function () {
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
    },

    baseOptionsForNonKF: function () {
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
    },

    render: function() {
      return (
        <div>
          {this.renderHighchartsWrapper()}
        </div>
      );
    },

    renderHighchartsWrapper: function() {
      if (this.props.showGradeLevelEquivalent === true) {
        return this.renderStarHighchartsWrapper();
      } else {
        return this.renderNonStarHighchartsWrapper();
      }
    },

    renderNonStarHighchartsWrapper: function() {
      return (
        <HighchartsWrapper
          {...merge(this.baseOptions(), {
            series: this.props.quadSeries.map(function(obj){
              return {
                name: obj.name,
                data: obj.data ? _.map(obj.data, QuadConverter.toPair): []
              };
            }),
            yAxis: this.props.yAxis
          })} />
      );
    },

    renderStarHighchartsWrapper: function() {
      return (
        <HighchartsWrapper
          {...merge(this.baseOptions(), {
            series: this.props.quadSeries.map(function(obj){
              return {
                name: obj.name,
                data: obj.data  ? _.map(obj.data, QuadConverter.toStarObject): []
              };
            }),
            yAxis: this.props.yAxis
          })} />
      );
    },

  });
})();
