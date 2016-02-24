(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var ProfileChart = window.shared.ProfileChart;
  var ProfileChartSettings = window.ProfileChartSettings;

  /*
  This renders details about ELA performance and growth in the student profile page.
  It's mostly historical charts.
  
  On charts, we could filter out older values, since they're drawn outside of the visible projection
  area, and Highcharts hovers look a little strange because of that.  It shows a bit more
  historical context though, so we'll keep all data points, even those outside of the visible
  range since interpolation lines will still be visible.
  */
  var ELADetails = window.shared.ELADetails = React.createClass({
    displayName: 'ELADetails',

    propTypes: {
      chartData: React.PropTypes.shape({
        star_series_reading_percentile: React.PropTypes.array.isRequired,
        mcas_series_ela_scaled: React.PropTypes.array.isRequired,
        mcas_series_ela_growth: React.PropTypes.array.isRequired
      }).isRequired
    },

    render: function() {
      return dom.div({ className: 'ELADetails'},
        this.renderStarReading(),
        this.renderMCASELAScores(),
        this.renderMCASELAGrowth()
      );
    },

    renderStarReading: function() {
      return createEl(ProfileChart, {
        quadSeries: [{
          name: 'Percentile rank',
          data: this.props.chartData.star_series_reading_percentile
        }],
        titleText: 'STAR Reading, last 4 years',
        yAxis: this.percentileYAxis()
      });
    },

    renderMCASELAScores: function() {
      return createEl(ProfileChart, {
        quadSeries: [{
          name: 'Scaled score',
          data: this.props.chartData.mcas_series_ela_scaled
        }],
        titleText: 'MCAS ELA scores, last 4 years',
        yAxis: merge(
            ProfileChartSettings.default_mcas_score_yaxis,
            {plotLines: ProfileChartSettings.mcas_level_bands}
        )
      });
    },

    renderMCASELAGrowth: function() {
      return createEl(ProfileChart, {
        quadSeries: [{
          name: 'Growth percentile',
          data: this.props.chartData.mcas_series_ela_growth
        }],
        titleText: 'MCAS ELA Growth, last 4 years',
        yAxis: this.percentileYAxis()
      });
    },

    // TODO(er) factor out
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