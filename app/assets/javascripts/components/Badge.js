import PropTypes from 'prop-types';
import React from 'react';


// A visual UI element for a badge indicating a particular 
// type of data (eg, in the home page feed).
function Badge({text, backgroundColor, style}) {
  const mergedStyle = {
    ...styles.badge,
    backgroundColor,
    ...style
  };
  return <span className="Badge" style={mergedStyle}>{text}</span>;
}
Badge.propTypes = {
  text: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  style: PropTypes.object
};

const styles = {
  badge: {
    padding: 5,
    color: 'white',
    opacity: 0.5
  }
};

export default Badge;