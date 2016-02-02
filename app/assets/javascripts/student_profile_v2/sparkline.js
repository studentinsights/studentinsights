(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

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
      var padding = 5;
      // var color = d3.scale.linear().domain([-50, 0, 50]).range(['red','#eee','blue']);
      // var thickness = d3.scale.linear().domain([-50, 0, 50]).range([3, 0, 3]);
      var x = d3.time.scale().domain(this.props.dateRange).range([padding, this.props.width - padding]);
      var y = d3.scale.linear().domain(this.props.valueRange).range([this.props.height - padding, padding]);
      var lineGenerator = d3.svg.line()
        .x(function(d) { return x(new Date(d[0], d[1] - 1, d[2])); })
        .y(function(d) { return y(d[3]); })
        .interpolate('monotone');

      return dom.div({ className: 'Sparkline' },
        dom.svg({
          height: this.props.height,
          width: this.props.width
        },
          dom.line({
            x1: padding,
            x2: this.props.width - padding,
            y1: y(this.props.thresholdValue),
            y2: y(this.props.thresholdValue),
            stroke: '#ccc',
            strokeDasharray: 5
          }),
          dom.path({
            d: lineGenerator(this.props.quads),
            stroke: 'red',
            strokeWidth: 3,
            fill: 'none'
          })
        )
      );
    }
  });
})();