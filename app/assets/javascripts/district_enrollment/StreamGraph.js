// import React from 'react';
// import _ from 'lodash';
// // window.d3;

// /* eslint-disable no-var */
// function draw(enrollments) {
//   const grades = _.uniq(enrollments.map(enrollment => enrollment.grade));
//   var n = grades.length; // number of layers

//   var stack = d3.stack().keys(d3.range(n)).offset(d3.stackOffsetWiggle);

//     var stack = d3.stack()
//       .keys(keys)
//       .order(d3.stackOrderNone)
//       .offset(d3.stackOffsetWiggle);
      
//   var svg = d3.select("svg"),
//       width = +svg.attr("width"),
//       height = +svg.attr("height");

//   var x = d3.scaleLinear()
//       .domain([0, m - 1])
//       .range([0, width]);

//   var y = d3.scaleLinear()
//       .domain([d3.min(layers, stackMin), d3.max(layers, stackMax)])
//       .range([height, 0]);

//   var z = d3.interpolateCool;

//   var area = d3.area()
//       .x(function(d, i) { return x(i); })
//       .y0(function(d) { return y(d[0]); })
//       .y1(function(d) { return y(d[1]); });

//   svg.selectAll("path")
//     .data(layers0)
//     .enter().append("path")
//       .attr("d", area)
//       .attr("fill", function() { return z(Math.random()); });
// }

// function stackMax(layer) {
//   return d3.max(layer, function(d) { return d[1]; });
// }

// function stackMin(layer) {
//   return d3.min(layer, function(d) { return d[0]; });
// }

// function transition() {
//   var t;
//   d3.selectAll("path")
//     .data((t = layers1, layers1 = layers0, layers0 = t))
//     .transition()
//       .duration(2500)
//       .attr("d", area);
// }

// export default class StreamGraph extends React.Component {

//   constructor(props) {
//     super(props);
//   }

//   draw() {

//   }

//   render() {
//     return <div className="StreamGraph" ref={el => this.el = el} />
//   }
// }