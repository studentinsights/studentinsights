import _ from 'lodash';
import {toDate} from './QuadConverter';

/*
Project quads outside of the date range, since interpolation will connect with previous data points.
*/
class BarChartSparkline extends React.Component {
  render() {
    const color = '#666';

    const x = d3.time.scale()
      .domain(this.props.dateRange)
      .range([0, this.props.width]);
    const y = d3.scale.linear()
      .domain(this.props.valueRange)
      .range([this.props.height, 0]);

    return (
      <div className="Sparkline" style={{ overflow: 'hidden' }}>
        <svg height={this.props.height} width={this.props.width}>
          {this.renderThresholdLine(this.props.thresholdValue, '#ccc', x, y)}
          {this.renderYearStarts(x, y)}
          {this.renderBars(this.props.quads, color, x, y)}
          {this.renderXAxis('#ccc', x, y)}
        </svg>
      </div>
    );
  }

  renderBars(quads, color, x, y) {
    return quads.map(function(quad){
      return (
        <rect
          // TODO: Unique enough? Will it cause namespace conflicts?
          key={quad.toString()}
          x={x(toDate(quad))}
          y={y(quad[3])}
          height={y.range()[0] - y(quad[3])}
          // Arbitrary width for now, seems to work fine.
          width={5}
          fill={color} />
      );
    });
  }

  renderXAxis(color, x, y) {
    return (
      <line
        x1={x.range()[0]}
        x2={x.range()[1]}
        y1={y.range()[0]}
        y2={y.range()[0]}
        stroke={color} />
    );
  }

  renderThresholdLine(value, color, x, y) {
    return (
      <line
        x1={x.range()[0]}
        x2={x.range()[1]}
        y1={y(value)}
        y2={y(value)}
        stroke={color}
        strokeDasharray={5} />
    );
  }

  // TODO(kr) check start of school year
  renderYearStarts(x, y) {
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
}

BarChartSparkline.propTypes = {
  height: React.PropTypes.number.isRequired,
  width: React.PropTypes.number.isRequired,
  quads: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.number)).isRequired,
  dateRange: React.PropTypes.array.isRequired,
  valueRange: React.PropTypes.array.isRequired,
  thresholdValue: React.PropTypes.number.isRequired,
};

export default BarChartSparkline;
