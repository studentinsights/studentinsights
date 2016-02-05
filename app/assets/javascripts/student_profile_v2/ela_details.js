(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var ProfileChartSettings = window.ProfileChartSettings;
  var HighchartsWrapper = window.shared.HighchartsWrapper;

  // This renders details about ELA performance and growth in 
  // the student profile page.  It's mostly historical charts.
  var ELADetails = window.shared.ELADetails = React.createClass({
    displayName: 'ELADetails',

    render: function() {
      return dom.div({ className: 'ELADetails'},
        this.renderStarReading(),
        this.renderMCASELAScores(),
        this.renderMCASELAGrowth()
      );
    },

    renderStarReading: function() {
      return createEl(HighchartsWrapper, merge(this.baseOptions(), {
        title: {
          text: 'STAR Reading',
          align: 'left'
        },
        series: [{
          name: 'Percentile rank',
          data: this.quadsToPairs(this.props.chartData.star_series_reading_percentile)
        }],
        yAxis: this.percentileYAxis()
      }));
    },

    renderMCASELAScores: function() {
      return createEl(HighchartsWrapper, merge(this.baseOptions(), {
        title: {
          text: 'MCAS ELA scores',
          align: 'left'
        },
        series: [{
          name: 'Scaled score',
          data: this.quadsToPairs(this.props.chartData.mcas_series_ela_scaled)
        }],
        yAxis: merge(ProfileChartSettings.default_mcas_score_yaxis, {
          plotLines: ProfileChartSettings.mcas_level_bands
        })
      }));
    },

    renderMCASELAGrowth: function() {
      return createEl(HighchartsWrapper, merge(this.baseOptions(), {
        title: {
          text: 'MCAS ELA Growth',
          align: 'left'
        },
        series: [{
          name: 'Growth percentile',
          data: this.quadsToPairs(this.props.chartData.mcas_series_ela_growth)
        }],
        yAxis: this.percentileYAxis()
      }));
    },

    // TODO(kr) factor out
    quadsToPairs: function(quads) {
      return quads.map(function(quad) {
        var date = Date.UTC(quad[0], quad[1] - 1, quad[2]);
        return [date, quad[3]];
      });
    },

    // TODO(kr) factor out
    baseOptions: function() {
      // TODO(kr) intervention plot bands, based on particular
      // interventions?
      return merge(ProfileChartSettings.base_options, {
        xAxis: merge(ProfileChartSettings.x_axis_datetime, {
          plotLines: this.x_axis_bands,
          max: new Date().getTime()
        })
      });
    },

    // TODO(kr) factor out
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