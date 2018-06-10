import PropTypes from 'prop-types';
import React from 'react';


// A visual UI element for a badge indicating a particular 
// high school house.
function HouseBadge({house, style}) {
  const mergedStyle = {
    ...styles.houseBadge,
    backgroundColor: '#333',
    color: 'white',
    opacity: 0.5,
    ...style
  };
  return <span className="HouseBadge" style={mergedStyle}>{`${house} house`}</span>;
}
HouseBadge.propTypes = {
  house: PropTypes.string.isRequired,
  style: PropTypes.object
};

const styles = {
  houseBadge: {
    padding: 5
  }
};

export default HouseBadge;