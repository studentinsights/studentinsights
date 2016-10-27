(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;
  var QuadConverter = window.shared.QuadConverter;

  var ProfileChartSettings = window.ProfileChartSettings;
  var HighchartsWrapper = window.shared.HighchartsWrapper;

  // Component for all charts in the profile page.
  window.shared.ProfileChart = React.createClass({
    displayName: 'ProfileChart',

    propTypes: {
      quadSeries: React.PropTypes.arrayOf( // you can plot multiple series on the same graph
        React.PropTypes.shape({
          name: React.PropTypes.string.isRequired, // e.g. 'Scaled score'
          data: React.PropTypes.array.isRequired // [year, month, date, value] quads
        })
      ),
      titleText: React.PropTypes.string.isRequired, // e.g. 'MCAS scores, last 4 years'
      yAxis: React.PropTypes.object.isRequired, // options for rendering the y-axis
      student: React.PropTypes.object.isRequired
    },

    getDefaultProps: function() {
      var now = moment.utc().toDate();
      // The intent of fixing this date range is that when staff are looking at profile of different students,
      // the scales are consistent (and not changing between 3 mos and 6 years depending on the student's record,
      // since that's easy to miss and misinterpret.
      var intervalBack = [4, 'years'];

      return {
        now: now,
        intervalBack: intervalBack,
        timestampRange: {
          min: moment(now).subtract(4, 'years').toDate().getTime(),
          max: now.getTime(),
        }
      };
    },

    render: function() {
      return createEl(HighchartsWrapper, merge(this.baseOptions(), {
        series: this.props.quadSeries.map(function(obj){
          return {
            name: obj.name,
            data: obj.data ? _.map(obj.data, QuadConverter.toPair): []
          }
        }),
        yAxis: this.props.yAxis
      }));
    },

    getSchoolYearStartPositions: function(n, now, current_grade){
      // Takes in an integer (number of months back), the current date
      // as a Moment object (UTC), and the student's current grade.
      // Returns an object mapping:
      // integer (timestamp) --> string (school year starting at that position).

      var range = [now.clone().subtract(n, 'months'), now];
      var startDates = QuadConverter.schoolYearStartDates(range);
      var create_label = function(current, grade){
        // Assumes that the student progressed grades in the usual fashion;
        // wasn't held back or skipped forward.
        // John Breslin says these events are very rare.
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
      var positionsForYearStarts = this.getSchoolYearStartPositions(
        48, moment.utc(), parseInt(this.props.student.grade)
      );

      return merge(ProfileChartSettings.base_options, {
        xAxis: [
          merge(ProfileChartSettings.x_axis_datetime, {
            plotLines: this.x_axis_bands,
            min: this.props.timestampRange.min,
            max: this.props.timestampRange.max
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
  });
})();
