import React from 'react';
import PropTypes from 'prop-types';
import {
  high,
  medium,
  low
} from '../helpers/colors';

export default function SliderChart({risk, benchmark, range, values, height, markerWidth = 3, style = {}}) {
  const riskX = (risk - range[0]) / (range[1] - range[0]);
  const benchmarkX = (benchmark - range[0]) / (range[1] - range[0]);
  return (
    <div style={{flex: 1, height: '100%', display: 'flex', flexDirection: 'row', position: 'relative', ...style}}>
      <div style={{position: 'absolute', top: Math.round(height/2), height: 2, background: medium, left: 0, right: 0}}></div>
      <div style={{position: 'absolute', top: Math.round(height/2), height: 2, background: high, left: `${Math.round(100*(1-benchmarkX))}%`, right: 0}}></div>
      <div style={{position: 'absolute', top: Math.round(height/2), height: 2, background: low, left: 0, right: `${Math.round(100*(1-riskX))}%` }}></div>
      {values.map((value, index) => renderLevel({
        value,
        risk,
        benchmark,
        index,
        height,
        markerWidth
      }))}
    </div>
  );
}
SliderChart.propTypes = {
  values: PropTypes.arrayOf(PropTypes.number).isRequired,
  risk: PropTypes.number.isRequired,
  benchmark: PropTypes.number.isRequired,
  range: PropTypes.array.isRequired,
  height: PropTypes.number.isRequired,
  markerWidth: PropTypes.number,
  style: PropTypes.object
};

function renderLevel(params) {
  const {
    risk,
    benchmark,
    value,
    index,
    height,
    markerWidth
  } = params;
  const percent = (value - range[0]) / (range[1] - range[0]);
  const {color} = classifyLevel(value, risk, benchmark);
  return (
    <div key={index}>
      <div style={{position: 'absolute', top: Math.round(height/4), height: Math.round(height/2), background: color, left: `${Math.round(100*percent)}%`, width: markerWidth}}></div>
    </div>
  );
}

function classifyLevel(value, risk, benchmark) {
  const isRisk = value <= risk;
  const isBenchmark = value >= benchmark;
  const color = (!value) ? null 
    : (isRisk) ? low
    : (isBenchmark) ? high
    : medium;
  return {isRisk, isBenchmark, color};
}
