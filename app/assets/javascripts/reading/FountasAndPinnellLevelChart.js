import React from 'react';
import PropTypes from 'prop-types';


export default function FountasAndPinnellLevelChart({levels, height, style = {}}) {
  const range = [
    'A'.charCodeAt(),
    'Z'.charCodeAt()
  ];

  return (
    <div style={{marginRight: 10, flex: 1, height: '100%', display: 'flex', flexDirection: 'row', position: 'relative', ...style}}>
      <div style={{opacity: 1.0, position: 'absolute', top: Math.round(height/2), height: 1, background: '#ccc', left: 0, right: 0}}></div>
      {levels.map(level => renderLevel(height, range, level))}
    </div>
  );
}
FountasAndPinnellLevelChart.propTypes = {
  levels: PropTypes.arrayOf(PropTypes.string).isRequired,
  style: PropTypes.object
};


function renderLevel(height, range, level) {
  const percent = (level.charCodeAt() - range[0]) / (range[1] - range[0]);
  const risk = ('J'.charCodeAt() - range[0]) / (range[1] - range[0]);
  const benchmark = ('N'.charCodeAt() - range[0]) / (range[1] - range[0]);
  const isRisk = level.charCodeAt() <= 'J'.charCodeAt();
  const isBenchmark = level.charCodeAt() >= 'N'.charCodeAt();
  const color = (!level) ? null 
    : (isRisk) ? 'orange'
    : (isBenchmark) ? '#85b985'
    : '#aaa';

  return (
    <div key={level}>
      <div style={{opacity: 1.0, position: 'absolute', top: Math.round(height/4), height: Math.round(height/2), background: color, left: `${Math.round(100*percent)}%`, width: 3}}></div>
      <div style={{opacity: (isBenchmark ? 1.0 : 0.25), position: 'absolute', top: Math.round(height/2), height: 3, background: '#85b985', left: `${Math.round(100*(1-benchmark))}%`, right: 0}}></div>
      <div style={{opacity: (isRisk ? 1.0 : 0.25), position: 'absolute', top: Math.round(height/2), height: 3, background: 'orange', left: 0, right: `${Math.round(100*(1-risk))}%` }}></div>
    </div>
  );
}