import React from 'react';
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
  // const width = 100;
  // const height = 40;
  // const yPad = 5;

  // const values = [
  //   tryDibels(dibels, '1', 'spring', dibelsKey),
  //   tryDibels(dibels, '2', 'fall', dibelsKey),
  //   tryDibels(dibels, '2', 'winter', dibelsKey),
  //   tryDibels(dibels, '2', 'spring', dibelsKey),
  //   tryDibels(dibels, '3', 'fall', dibelsKey)
  // ];

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
  // const line = d3.svg.line()
  //   .x((d, i) => x(i))
  //   .y(d => y(d))
  //   .defined(d => d)
  //   .interpolate('basis');

  // const isGrowing = _.last(_.compact(values)) > _.first(_.compact(values));
  // const strokeWidth = isGrowing ? 2 : 1;
  // const color = isGrowing ? 'green' : '#666';

  // third grade dorf wpm
  const aboveBenchmark = (_.last(_.compact(values)) >= benchmark);
  const belowRisk = (_.last(_.compact(values)) <= risk);
  const strokeWidth = 1;
  const color = aboveBenchmark ? '#85b985' : belowRisk ? 'orange' : '#ccc';
  return (
    <svg width={width} height={height} style={style}>
      <path d={line(values)} stroke={color} strokeWidth={strokeWidth} fill={color} />
    </svg>
  );
}
