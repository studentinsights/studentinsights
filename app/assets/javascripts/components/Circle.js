import PropTypes from 'prop-types';
import React from 'react';


// Visual UI component to show a circle around a number
export default function Circle({text, color, style = {}}) {
  return (
    <div style={{display: 'inline-block', ...style}}>
      <svg viewBox="0 0 24 24" style={{
        display: 'inline-block',
        color,
        fill: color,
        height: 24,
        width: 24,
        userSelect: 'none',
        transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
        fontSize: 24
      }}>
        <circle cx={12} cy={12} r={10}></circle>
        <text x={12} y={16} textAnchor="middle" fontSize={12} fill="#fff">{text}</text>
      </svg>
    </div>
  );
}
Circle.propTypes = {
  text: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  style: PropTypes.object
};
