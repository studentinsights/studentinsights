(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var ProfileChart = window.shared.ProfileChart;
  var ProfileChartSettings = window.ProfileChartSettings;

  var styles = {
    title: {
      color: 'black',
      paddingBottom: 20,
      fontSize: 24
    },
    container: {
      width: '100%',
      marginTop: 50,
      marginLeft: 'auto',
      marginRight: 'auto',
      border: '1px solid #ccc',
      padding: '30px 30px 30px 30px',
      position: 'relative'
    },
    secHead: {
      display: 'flex',
      justifyContent: 'space-between',
      borderBottom: '1px solid #333',
      position: 'absolute',
      top: 30,
      left: 30,
      right: 30
    },
    navBar: {
      fontSize: 18
    },
    navTop: {
      textAlign: 'right',
      verticalAlign: 'text-top'
    }
  };

  /*
  This renders details about math performance and growth in the student profile page.
  It's mostly historical charts.

  On charts, we could filter out older values, since they're drawn outside of the visible projection
  area, and Highcharts hovers look a little strange because of that.  It shows a bit more
  historical context though, so we'll keep all data points, even those outside of the visible
  range since interpolation lines will still be visible.
  */
  var MathDetails = window.shared.MathDetails = React.createClass({
    displayName: 'MathDetails',

    propTypes: {
      chartData: React.PropTypes.shape({
        star_series_math_percentile: React.PropTypes.array.isRequired,
        mcas_series_math_scaled: React.PropTypes.array.isRequired,
        mcas_series_math_growth: React.PropTypes.array.isRequired
      }).isRequired
    },

    render: function() {
      return dom.div({ className: 'MathDetails' },
        this.renderNavBar(),
        this.renderStarMath(),
        this.renderMCASMathScore(),
        this.renderMCASMathGrowth()
      );
    },

    renderNavBar: function() {
      return dom.div({ style: styles.navBar },
          dom.a({ style: styles.navBar, href: '#starMath'}, 'STAR Math Chart'), ' | ',
          dom.a({ style: styles.navBar, href: '#MCASMath'}, 'MCAS Math Chart'), ' | ',
          dom.a({ style: styles.navBar, href: '#MCASMathGrowth'}, 'MCAS Math SGPs')
        );
    },

    renderHeader: function(title) {
      return dom.div({ style: styles.secHead },
        dom.h4({ style: styles.title }, title),
        dom.span({ style: styles.navTop }, dom.a({ href: '#' }, 'Back to top'))
      );
    },


    renderStarMath: function() {
      return dom.div({ id: 'starMath', style: styles.container},
        this.renderHeader('STAR Math, last 4 years'),
        createEl(ProfileChart, {
        quadSeries: [{
          name: 'Percentile rank',
          data: this.props.chartData.star_series_math_percentile
        }],
        yAxis: merge(this.percentileYAxis(), {
          title: { text: 'Percentile rank' }
        })
      }));
    },

    renderMCASMathScore: function() {
      return dom.div({ id: 'MCASMath', style: styles.container},
        this.renderHeader('MCAS Math Scores, last 4 years'),
        createEl(ProfileChart, {
        quadSeries: [{
          name: 'Scaled score',
          data: this.props.chartData.mcas_series_math_scaled
        }],
        yAxis: merge(ProfileChartSettings.default_mcas_score_yaxis,{
          plotLines: ProfileChartSettings.mcas_level_bands,
          title: { text: 'Scaled score' }
        })
      }));
    },

    renderMCASMathGrowth: function() {
      return dom.div({ id: 'MCASMathGrowth', style: styles.container},
        this.renderHeader('MCAS Math SGPs, last 4 years'),
        createEl(ProfileChart, {
        quadSeries: [{
          name: 'Student growth percentile (SGP)',
          data: this.props.chartData.mcas_series_math_growth
        }],
        yAxis: merge(this.percentileYAxis(), {
          title: { text: 'Student growth percentile (SGP)' }
        })
      }));
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
