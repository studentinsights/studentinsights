(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var QuadConverter = window.shared.QuadConverter;

  /*
  Project quads outside of the date range, since interpolation will connect with previous data points.
  */
  var BarChartSparkline = window.shared.BarChartSparkline = React.createClass({
    displayName: 'BarChartSparkline',

    propTypes: {
      height: React.PropTypes.number.isRequired,
      width: React.PropTypes.number.isRequired,
      quads: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.number)).isRequired,
      dateRange: React.PropTypes.array.isRequired,
      valueRange: React.PropTypes.array.isRequired,
      thresholdValue: React.PropTypes.number.isRequired,
    },

    render: function() {
      var color = '#666';

      var x = d3.time.scale()
        .domain(this.props.dateRange)
        .range([0, this.props.width]);
      var y = d3.scale.linear()
        .domain(this.props.valueRange)
        .range([this.props.height, 0]);

      return dom.div({ className: 'Sparkline', style: { overflow: 'hidden' }},
        dom.svg({
          height: this.props.height,
          width: this.props.width
        },
        this.renderThresholdLine(this.props.thresholdValue, '#ccc', x, y),
        this.renderYearStarts(x, y),
        this.renderBars(this.props.quads, color, x, y),
        this.renderXAxis('#ccc', x, y)
      ));
    },

    renderBars: function(quads, color, x, y){
      var self = this;
      return quads.map(function(quad){
        return dom.rect({
          key: quad.toString(), // TODO: Unique enough? Will it cause namespace conflicts?
          x: x(QuadConverter.toDate(quad)),
          y: y(quad[3]),
          height: y.range()[0] - y(quad[3]),
          width: 5, // Arbitrary width for now, seems to work fine.
          fill: color
        })
      });
    },

    renderXAxis: function(color, x, y){
      return dom.line({
        x1: x.range()[0],
        x2: x.range()[1],
        y1: y.range()[0],
        y2: y.range()[0],
        stroke: color
      })
    },

    renderThresholdLine: function(value, color, x, y){
      return dom.line({
        x1: x.range()[0],
        x2: x.range()[1],
        y1: y(value),
        y2: y(value),
        stroke: color,
        strokeDasharray: 5
      });
    },

    // TODO(kr) check start of school year
    renderYearStarts: function(x, y) {
      var years = _.range(this.props.dateRange[0].getFullYear(), this.props.dateRange[1].getFullYear());
      return years.map(function(year) {
        var yearStartDate = moment.utc([year, 8, 15].join('-'), 'YYYY-M-D').toDate();
        return dom.line({
          key: year,
          x1: x(yearStartDate),
          x2: x(yearStartDate),
          y1: y.range()[0],
          y2: y.range()[1],
          stroke: '#ccc'
        });
      });
    }
  });
})();
