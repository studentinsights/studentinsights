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
      yAxis: React.PropTypes.object.isRequired // options for rendering the y-axis
    },

    getDefaultProps: function() {
      var now = moment.utc().toDate();
      // TODO(kr) align to school year?
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
        title: {
          text: this.props.titleText,
          align: 'left'
        },
        series: this.props.quadSeries.map(function(obj){
          return {
            name: obj.name,
            data: obj.data ? _.map(obj.data, QuadConverter.toPair): []
          }
        }),
        yAxis: this.props.yAxis
      }));
    },

    baseOptions: function() {
      return merge(ProfileChartSettings.base_options, {
        xAxis: merge(ProfileChartSettings.x_axis_datetime, {
          plotLines: this.x_axis_bands,
          min: this.props.timestampRange.min,
          max: this.props.timestampRange.max
        })
      });
    },
  });
})();