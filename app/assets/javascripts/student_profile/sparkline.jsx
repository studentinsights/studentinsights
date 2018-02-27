import _ from 'lodash';
import QuadConverter from './QuadConverter.js';

(function() {
  window.shared || (window.shared = {});

  /*
  Project quads outside of the date range, since interpolation will connect with previous data points.
  */
  window.shared.Sparkline = React.createClass({
    displayName: 'Sparkline',

    propTypes: {
      height: React.PropTypes.number.isRequired,
      width: React.PropTypes.number.isRequired,
      quads: React.PropTypes.arrayOf(React.PropTypes.arrayOf(
        React.PropTypes.oneOfType([ React.PropTypes.string, React.PropTypes.number ])
      )).isRequired,
      dateRange: React.PropTypes.array.isRequired,
      valueRange: React.PropTypes.array.isRequired,
      thresholdValue: React.PropTypes.number.isRequired,
      shouldDrawCircles: React.PropTypes.bool
    },

    getDefaultProps: function() {
      return {
        shouldDrawCircles: true
      };
    },

    computeDelta(quads) {
      const filteredQuadValues = _.compact(quads.map(function(quad) {
        const date = QuadConverter.toDate(quad);
        if (date > this.props.dateRange[0] && date < this.props.dateRange[1]) return null;
        return quad[3];
      }, this));
      if (filteredQuadValues.length < 2) return 0;
      return _.last(filteredQuadValues) - _.first(filteredQuadValues);
    },

    render: function() {
      const padding = 3; // for allowing circle data points at the edge to be full shown

      // TODO(kr) work more on coloring across all charts
      // for now, disable since the mapping to color isn't clear enough and
      // doesn't match the longer-view charts
      const color = function() { return '#666'; };

      const x = d3.time.scale()
        .domain(this.props.dateRange)
        .range([padding, this.props.width - padding]);
      const y = d3.scale.linear()
        .domain(this.props.valueRange)
        .range([this.props.height - padding, padding]);
      const lineGenerator = d3.svg.line()
        .x(function(d) { return x(QuadConverter.toDate(d)); }.bind(this))
        .y(function(d) { return y(d[3]); })
        .interpolate('linear');

      const lineColor = color(this.computeDelta(this.props.quads));
      return (
        <div className="Sparkline" style={{ overflow: 'hidden' }}>
          <svg height={this.props.height} width={this.props.width}>
            <line
              x1={x.range()[0]}
              x2={x.range()[1]}
              y1={y(this.props.thresholdValue)}
              y2={y(this.props.thresholdValue)}
              stroke="#ccc"
              strokeDasharray={5} />
            {this.renderYearStarts(padding, x, y)}
            <path
              d={lineGenerator(this.props.quads)}
              stroke={lineColor}
              strokeWidth={3}
              fill="none" />
            {(!this.props.shouldDrawCircles) ? null : this.props.quads.map(function(quad) {
              return (
                <circle
                  key={quad.slice(0, 3).join(',')}
                  cx={lineGenerator.x()(quad)}
                  cy={lineGenerator.y()(quad)}
                  r={3}
                  fill={lineColor} />
              );
            })}
          </svg>
        </div>
      );
    },

    // TODO(kr) check start of school year
    renderYearStarts: function(padding, x, y) {
      const years = _.range(this.props.dateRange[0].getFullYear(), this.props.dateRange[1].getFullYear());
      return years.map(function(year) {
        const yearStartDate = moment.utc([year, 8, 15].join('-'), 'YYYY-M-D').toDate();
        return (
          <line
            key={year}
            x1={x(yearStartDate)}
            x2={x(yearStartDate)}
            y1={y.range()[0]}
            y2={y.range()[1]}
            stroke="#ccc" />
        );
      });
    }
  });
})();
