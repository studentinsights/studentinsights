import React from 'react';


// Renders a calendar heatmap like https://bl.ocks.org/mbostock/4063318
class CalendarHeatmap extends React.Component {
  componentDidMount() {
    this.update(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.update(nextProps);
  }

  update(props) {
    const {data, years, color, title, width, height, cellSize} = props;
    drawCalendarHeatmap(this.el, data, {
      years,
      color: color || defaultColor(),
      title,
      width,
      height,
      cellSize
    });
  }

  render() {
    return <div className="CalendarHeatmap" ref={(el) => this.el = el} />;
  }
}
CalendarHeatmap.propTypes = {
  data: React.PropTypes.object.isRequired,
  years: React.PropTypes.array.isRequired,
  color: React.PropTypes.func,
  title: React.PropTypes.func,
  width: React.PropTypes.number,
  height: React.PropTypes.number,
  cellSize: React.PropTypes.number
};
CalendarHeatmap.defaultProps = {
  width: 960,
  height: 136,
  cellSize: 17,
  title: (key, value) => [key, value].join(': ')
};


/* eslint-disable no-var */
/* eslint-disable indent */
function pathMonth(cellSize, t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
      d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
      + "H" + w0 * cellSize + "V" + 7 * cellSize
      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
      + "H" + (w1 + 1) * cellSize + "V" + 0
      + "H" + (w0 + 1) * cellSize + "Z";
}

// Adapted from https://bl.ocks.org/mbostock/4063318
function drawCalendarHeatmap(el, data, options) {
  const {years, color, title, width, height, cellSize} = options;

  el.innerHTML = ''; // inefficient stateless re-render
  var svg = d3.select(el)
    .selectAll("svg")
    .data(d3.range(...years))
    .enter().append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

  svg.append("text")
      .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .text(function(d) { return d; });

  var rect = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#eee")
    .selectAll("rect")
    .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("rect")
      .attr('title', function(d) { return d.getDay(); })
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", function(d) { return d3.time.weekOfYear(d) * cellSize; })
      .attr("y", function(d) { return d.getDay() * cellSize; })
      .datum(d3.time.format("%Y-%m-%d"));

  svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#666")
    .selectAll("path")
    .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("path")
      .attr("d", pathMonth.bind(null, cellSize));

  rect.filter(function(d) { return d in data; })
      .attr("fill", function(d) { return color(data[d]); })
    .append("title")
      .text(function(d) { return title(d, data[d]); });
}
/* eslint-enable no-var */
/* eslint-enable indent */

function defaultColor() {
  return d3.scale.linear().range(['white', 'blue']);
}



export default CalendarHeatmap;