import React from 'react';


// Visual UI component to show a circle around a number
export default function Circle({text, color, style = {}}) {
  return <div style={{display: 'inline-block', ...style}} dangerouslySetInnerHTML={{__html: `<svg viewBox="0 0 24 24" style="display: inline-block; color: ${color}; fill: ${color}; height: 24px; width: 24px; user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms; font-size: 24px;"><circle cx="12" cy="12" r="10"></circle><text x="12" y="16" text-anchor="middle" font-size="12" fill="#fff">${text}</text></svg>`}} />;
}
Circle.propTypes = {
  text: React.PropTypes.string.isRequired,
  color: React.PropTypes.string.isRequired,
  style: React.PropTypes.object
};
