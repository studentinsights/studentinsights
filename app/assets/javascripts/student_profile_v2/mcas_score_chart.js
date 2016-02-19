(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var ProfileChartSettings = window.ProfileChartSettings;
  var HighchartsWrapper = window.shared.HighchartsWrapper;

  // This component is a chart that will render the scaled MCAS scores.
  window.shared.MCASScoreChart = React.createClass({
    displayName: 'MCASScoreChart',

    propTypes: {
      data: React.PropTypes.array.isRequired,
      subject: React.PropTypes.string.isRequired // 'Math' or 'ELA'
    },

    quadsToPairs: function(quads) {
      return quads.map(function(quad) {
        var date = Date.UTC(quad[0], quad[1] - 1, quad[2]);
        return [date, quad[3]];
      });
    },

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

    getDefaultProps: function() {
      return {
        now: new Date(),
        intervalBack: [4, 'years']
      };
    },

    render: function() {
      return createEl(HighchartsWrapper, merge(this.baseOptions(), {
        title: {
          text: 'MCAS ' + this.props.subject +' scores, last 4 years',
          align: 'left'
        },
        series: [{
          name: 'Scaled score',
          data: this.quadsToPairs(this.props.data || [])
        }],
        yAxis: merge(ProfileChartSettings.default_mcas_score_yaxis, {
          plotLines: ProfileChartSettings.mcas_level_bands
        })
      }));
    },

    timestampRange: function() {
      return {
        min: moment(this.props.now).subtract(this.props.intervalBack[0], this.props.intervalBack[1]).toDate().getTime(),
        max: this.props.now.getTime()
      };
    },

  });
})();