import React from 'react';
import PropTypes from 'prop-types';

// From https://material.io/tools/icons/?search=open&icon=open_in_browser&style=baseline
export default function DialogIcon({size = 14, style = {}}) {
  return (
    <svg className="DialogIcon" style={{fill: '#3177c9', opacity: 0.75, ...style}} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h4v-2H5V8h14v10h-4v2h4c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm-7 6l-4 4h3v6h2v-6h3l-4-4z"/>
    </svg>
  );
}
DialogIcon.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object
};

export function wrapped({icon, children}) {
  return (
    <div style={{display: 'inline-block'}}>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <span style={{paddingRight: 3}}>{children}</span>
        {icon}
      </div>
    </div>
  );
}
wrapped.propTypes = {
  children: PropTypes.node.isRequired,
  icon: PropTypes.node.isRequired
};