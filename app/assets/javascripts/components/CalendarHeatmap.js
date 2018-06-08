import React from 'react';
import _ from 'lodash';
import {startOfSchoolForYear, endOfSchoolForYear} from '../helpers/schoolYear';


// Renders a calendar heatmap like https://bl.ocks.org/mbostock/4063318
// but aligned to the school year.
export default class CalendarHeatmap extends React.Component {
  componentDidMount() {
    this.update(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.update(nextProps);
  }

  update(props) {
    const {year, data, color, title, width, height} = props;
    drawCalendarHeatmap(this.el, data, {
      year,
      title,
      width,
      height,
      color: color || defaultColor(),
      cellSize: cellSizeForWidth(width)
    });
  }

  

  render() {
    return (
      <div className="CalendarHeatmap">
        <div ref={(el) => this.el = el}></div>
        {this.renderLine()}
      </div>
    );
  }

  renderLine() {
    const {year, data, width} = this.props;
    const {days, firstSunday} = schoolYearDays(year);
    
    // Sum by week
    const weekCounts = {};
    _.each(data, (count, dateText) => {
      const weekOffset = weeksSince(new Date(dateText), firstSunday);
      weekCounts[weekOffset] = (weekCounts[weekOffset] || 0) + count;
    });
    const points = _.map(weekCounts, (totalCount, weekOffset) => {
      return {weekOffset, totalCount};
    });

    // Fill in gaps
    days.forEach(day => {
      const weekOffset = weeksSince(day, firstSunday);
      weekCounts[weekOffset] = (weekCounts[weekOffset] || 0) + 0;
    });

    // Project
    const height = 50;
    const cellSize = cellSizeForWidth(width);
    const maxCount = _.max(points, p => p.totalCount).totalCount;
    const yDomain = [(maxCount > 100) ? 500 : 100, 0];
    const y = d3.time.scale()
      .domain(yDomain)
      .range([0, height]);
    const lineGenerator = d3.svg.line()
      .x(d => (cellSize/2) + (d.weekOffset * cellSize)) // middle of the cell
      .y(d => y(d.totalCount))
      .interpolate('linear');

    return (
      <div style={{position: 'relative', borderRight: '1px solid #999'}}>
        <div style={{position: 'absolute', right: 5, color: '#333', fontSize: 12, top: 0}}>{yDomain[0]}</div>
        <div style={{position: 'absolute', right: 5, color: '#333', fontSize: 12, bottom: 0}}>{yDomain[1]}</div>
        <svg height={height} width={width}>
          <path
            d={lineGenerator(points)}
            stroke="#333"
            strokeWidth={1}
            fill="none" />
        </svg>
      </div>
    );
  }
}
CalendarHeatmap.propTypes = {
  data: React.PropTypes.object.isRequired,
  year: React.PropTypes.number.isRequired,
  color: React.PropTypes.func,
  title: React.PropTypes.func,
  width: React.PropTypes.number,
  height: React.PropTypes.number
};
CalendarHeatmap.defaultProps = {
  width: 960,
  height: 136,
  title: (key, value) => [key, value].join(': ')
};

function cellSizeForWidth(width) {
  const weeksCount = 52;
  return Math.floor(width / weeksCount);
}

// Align to Sunday of first day passed
function schoolYearDays(year) {
  const days = d3.time.days(startOfSchoolForYear(year), endOfSchoolForYear(year));
  const firstDayPassed = _.first(days);
  const firstSunday = moment.utc(firstDayPassed).subtract(firstDayPassed.getDay(), 'days').toDate();

  return {days, firstSunday};
}
/* eslint-disable no-var */
/* eslint-disable indent */
// Adapted from https://bl.ocks.org/mbostock/4063318
function drawCalendarHeatmap(el, data, options) {
  const {year, color, title, width, height, cellSize} = options;
  const {days, firstSunday} = schoolYearDays(year);

  // simple but inefficient re-render of everything
  el.innerHTML = '';

  // Draw the container
  var svg = d3.select(el)
    .selectAll("svg")
    .data([year])
    .enter().append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

  // Label
  svg.append("text")
      .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .text(function(d) { return d; });

  // Boxes
  var rect = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#eee")
    .selectAll("rect")
    .data(days)
    .enter().append("rect")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", function(d) { return weeksSince(d, firstSunday) * cellSize; })
      .attr("y", function(d) { return d.getDay() * cellSize; })
      .datum(d3.time.format("%Y-%m-%d"));

  // Fill in actual days
  rect.filter(function(d) { return d in data; })
      .attr("fill", function(d) { return color(data[d]); })
    .append("title")
      .text(function(d) { return title(d, data[d]); });

  // Outline months
  svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#666")
    .selectAll("path")
    .data(function(d) { return d3.time.months(_.first(days), _.last(days)); })
    .enter().append("path")
      .attr("d", pathMonth.bind(null, cellSize, firstSunday));
}

function pathMonth(cellSize, firstSunday, t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = t0.getDay(), w0 = weeksSince(t0, firstSunday),
      d1 = t1.getDay(), w1 = weeksSince(t1, firstSunday);
  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
      + "H" + w0 * cellSize + "V" + 7 * cellSize
      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
      + "H" + (w1 + 1) * cellSize + "V" + 0
      + "H" + (w0 + 1) * cellSize + "Z";
}
/* eslint-enable no-var */
/* eslint-enable indent */

function weeksSince(day, firstSunday) {
  return moment.utc(day).diff(moment.utc(firstSunday), 'weeks');
}

function defaultColor() {
  return d3.scale.linear().range(['white', 'blue']);
}
