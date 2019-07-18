import React from 'react';
import PropTypes from 'prop-types';
import {
  high,
  medium,
  low
} from '../helpers/colors';

// See also `readingData.js`
const range = [
  'A'.charCodeAt(),
  'Z'.charCodeAt()
];

// Not generalized; fixed to one particular grade and period right now.
// See also `readingData.js`
export default function FountasAndPinnellLevelChart({levels, height, markerWidth = 3, style = {}}) {
  const risk = ('J'.charCodeAt() - range[0]) / (range[1] - range[0]);
  const benchmark = ('N'.charCodeAt() - range[0]) / (range[1] - range[0]);
  return (
    <div style={{flex: 1, height: '100%', display: 'flex', flexDirection: 'row', position: 'relative', ...style}}>
      <div style={{position: 'absolute', top: Math.round(height/2), height: 2, background: medium, left: 0, right: 0}}></div>
      <div style={{position: 'absolute', top: Math.round(height/2), height: 2, background: high, left: `${Math.round(100*(1-benchmark))}%`, right: 0}}></div>
      <div style={{position: 'absolute', top: Math.round(height/2), height: 2, background: low, left: 0, right: `${Math.round(100*(1-risk))}%` }}></div>
      {levels.map(level => renderLevel(height, level, markerWidth))}
    </div>
  );
}
FountasAndPinnellLevelChart.propTypes = {
  isForSingleFixedGradeLevel: PropTypes.bool.isRequired, // TODO(kr) generalize to read levels
  height: PropTypes.number.isRequired,
  levels: PropTypes.arrayOf(PropTypes.string).isRequired,
  markerWidth: PropTypes.number,
  style: PropTypes.object
};

function renderLevel(height, level, markerWidth) {
  const percent = (level.charCodeAt() - range[0]) / (range[1] - range[0]);
  const {color} = classifyLevel(level);
  return (
    <div key={level}>
      <div style={{position: 'absolute', top: Math.round(height/4), height: Math.round(height/2), background: color, left: `${Math.round(100*percent)}%`, width: markerWidth}}></div>
    </div>
  );
}

export function classifyLevel(level) {
  const isRisk = level.toUpperCase().charCodeAt() <= 'J'.charCodeAt();
  const isBenchmark = level.toUpperCase().charCodeAt() >= 'N'.charCodeAt();
  const color = (!level) ? null 
    : (isRisk) ? low
      : (isBenchmark) ? high
        : medium;
  return {isRisk, isBenchmark, color};
}
