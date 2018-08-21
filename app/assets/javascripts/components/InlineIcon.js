import React from 'react';
import PropTypes from 'prop-types';

// For taking plain text and wrapping it with an icon to the right.
export default function InlineIcon({icon, children}) {
  return (
    <div className="InlineIcon" style={{display: 'inline-block'}}>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <span style={{paddingRight: 3}}>{children}</span>
        {icon}
      </div>
    </div>
  );
}
InlineIcon.propTypes = {
  children: PropTypes.node.isRequired,
  icon: PropTypes.node.isRequired
};