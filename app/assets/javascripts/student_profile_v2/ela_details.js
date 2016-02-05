(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var ProfileChartSettings = window.ProfileChartSettings;
  var HighchartsWrapper = window.shared.HighchartsWrapper;

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

    getDefaultProps: function() {
      return {
        now: new Date(),
        intervalBack: [4, 'years']
      };
    },

    // TODO(kr) align these to school year?
    timestampRange: function() {
      return {
        min: moment(this.props.now).subtract(this.props.intervalBack[0], this.props.intervalBack[1]).toDate().getTime(),
        max: this.props.now.getTime()
      };
    },

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
          text: 'STAR Reading, last 4 years',
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
          text: 'MCAS ELA scores, last 4 years',
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
          text: 'MCAS ELA Growth, last 4 years',
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
      var timestampRange = this.timestampRange();
      return merge(ProfileChartSettings.base_options, {
        xAxis: merge(ProfileChartSettings.x_axis_datetime, {
          plotLines: this.x_axis_bands,
          min: timestampRange.min,
          max: timestampRange.max
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