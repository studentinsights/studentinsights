(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  /*
  Project quads outside of the date range, since interpolation will connect with previous data points.
  */
  var Sparkline = window.shared.Sparkline = React.createClass({
    displayName: 'Sparkline',

    propTypes: {
      height: React.PropTypes.number.isRequired,
      width: React.PropTypes.number.isRequired,
      quads: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.number)).isRequired,
      dateRange: React.PropTypes.array.isRequired,
      valueRange: React.PropTypes.array.isRequired,
      thresholdValue: React.PropTypes.number.isRequired,
    },

    render: function() {
      var padding = 3; // for allowing circle data points at the edge to be full shown
      // TODO(kr) work more on coloring across all charts
      var color = d3.scale.linear().domain([-1, 0, 1]).range(['red', '#666', 'blue']);
      var x = d3.time.scale()
        .domain(this.props.dateRange)
        .range([padding, this.props.width - padding]);
      var y = d3.scale.linear()
        .domain(this.props.valueRange)
        .range([this.props.height - padding, padding]);
      var lineGenerator = d3.svg.line()
        .x(function(d) { return x(this.quadDate(d)); }.bind(this))
        .y(function(d) { return y(d[3]); })
        .interpolate('linear');

      var lineColor = color(this.delta(this.props.quads));
      return dom.div({ className: 'Sparkline' },
        dom.svg({
          height: this.props.height,
          width: this.props.width
        },
          dom.line({
            x1: padding,
            x2: this.props.width,
            y1: y(this.props.thresholdValue),
            y2: y(this.props.thresholdValue),
            stroke: '#ccc',
            strokeDasharray: 5
          }),
          dom.path({
            d: lineGenerator(this.props.quads),
            stroke: lineColor,
            strokeWidth: 3,
            fill: 'none'
          }),
          this.props.quads.map(function(quad) {
            return dom.circle({
              key: quad.slice(0, 3).join(','),
              cx: lineGenerator.x()(quad),
              cy: lineGenerator.y()(quad),
              r: 3,
              fill: lineColor
            });
          })
        )
      );
    },

    delta: function(quads) {
      var filteredQuadValues = _.compact(quads.map(function(quad) {
        var date = this.quadDate(quad);
        if (date > this.props.dateRange[0] && date < this.props.dateRange[1]) return null;
        return quad[3];
      }, this));
      if (filteredQuadValues.length < 2) return 0;
      return _.last(filteredQuadValues) - _.first(filteredQuadValues);
    },

    quadDate: function(quad) { 
      return new Date(quad[0], quad[1] - 1, quad[2]);
    }
  });
})();