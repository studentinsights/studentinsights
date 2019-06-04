import React from 'react';
import PropTypes from 'prop-types';
import d3 from 'd3';
import _ from 'lodash';


export default function DibelsSparkline(props) {
  const {
    width,
    height,
    yPad,
    values,
    benchmark,
    risk,
    domain,
    style
  } = props;

  const x = d3.scale.linear()
    .domain([0, values.length - 1])
    .range([0, width]);
  const y = d3.scale.linear()
    .domain(domain)
    .range([height - yPad, yPad]);

  const line = d3.svg.area()
    .x((d, i) => x(i))
    .y0(height - yPad)
    .y1(d => y(d))
    .defined(d => d)
    .interpolate('basis');

  // third grade dorf wpm
  const aboveBenchmark = benchmark ? (_.last(_.compact(values)) >= benchmark) : false;
  const belowRisk = risk ? (_.last(_.compact(values)) <= risk) : false;
  const strokeWidth = 1;
  const color = aboveBenchmark ? '#85b985' : belowRisk ? 'orange' : '#ccc';
  return (
    <svg width={width} height={height} style={style}>
      <path d={line(values)} stroke={color} strokeWidth={strokeWidth} fill={color} />
    </svg>
  );
}
DibelsSparkline.propTypes = {
  risk: PropTypes.number,
  benchmark: PropTypes.number
};