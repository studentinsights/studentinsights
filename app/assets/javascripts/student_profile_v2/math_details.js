(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var ProfileChartSettings = window.ProfileChartSettings;
  var HighchartsWrapper = window.shared.HighchartsWrapper;
  var MCASScoreChart = window.shared.MCASScoreChart;

  var MathDetails = window.shared.MathDetails = React.createClass({
    displayName: 'MathDetails',

    propTypes: {
      chartData: React.PropTypes.shape({
        star_series_math_percentile: React.PropTypes.array.isRequired,
        mcas_series_math_scaled: React.PropTypes.array.isRequired,
        mcas_series_math_growth: React.PropTypes.array.isRequired
      }).isRequired
    },

    getDefaultProps: function() {
      return {
        now: new Date(),
        intervalBack: [4, 'years']
      };
    },

    // TODO(kr/er) align these to school year?
    // The intent of fixing this date range is that when staff are looking at profile of different students,
    // the scales are consistent (and not changing between 3 mos and 6 years depending on the student's record,
    // since that's easy to miss and misinterpret.
    timestampRange: function() {
      return {
        min: moment(this.props.now).subtract(this.props.intervalBack[0], this.props.intervalBack[1]).toDate().getTime(),
        max: this.props.now.getTime()
      };
    },

    render: function() {
      return dom.div({ className: 'MathDetails' },
        this.renderStarMath(),
        createEl(MCASScoreChart, {data: this.props.chartData.mcas_series_math_scaled, subject: 'Math'}),
        this.renderMCASMathGrowth()
      );
    },

    renderStarMath: function() {
      return createEl(HighchartsWrapper, merge(this.baseOptions(), {
        title: {
          text: 'STAR Math, last 4 years',
          align: 'left'
        },
        series: [{
          name: 'Percentile rank',
          data: this.quadsToPairs(this.props.chartData.star_series_math_percentile || [])
        }],
        yAxis: this.percentileYAxis()
      }));
    },

    renderMCASMathGrowth: function() {
      return createEl(HighchartsWrapper, merge(this.baseOptions(), {
        title: {
          text: 'MCAS Math Growth, last 4 years',
          align: 'left'
        },
        series: [{
          name: 'Growth percentile',
          data: this.quadsToPairs(this.props.chartData.mcas_series_math_growth || [])
        }],
        yAxis: this.percentileYAxis()
      }));
    },

    // TODO(kr/er) factor out
    quadsToPairs: function(quads) {
      return quads.map(function(quad) {
        var date = Date.UTC(quad[0], quad[1] - 1, quad[2]);
        return [date, quad[3]];
      });
    },

    // TODO(kr/er) factor out
    baseOptions: function() {
      // TODO(kr/er) intervention plot bands, based on particular
      // interventions?
      var timestampRange = this.timestampRange();
      return merge(ProfileChartSettings.base_options, {
        xAxis: merge(ProfileChartSettings.x_axis_datetime, {
          plotLines: this.x_axis_bands,
          min: timestampRange.min,
          max: timestampRange.max
        })
      });
    },

    // TODO(kr/er) factor out
    percentileYAxis: function() {
      return merge(ProfileChartSettings.percentile_yaxis, {
        plotLines: [{
          color: '#666',
          width: 1,
          zIndex: 3,
          value: 50,
          label: {
            text: '50th percentile',
            align: 'center',
            style: {
              color: '#999999'
            }
          }
        }]
      });
    }
  });
})();