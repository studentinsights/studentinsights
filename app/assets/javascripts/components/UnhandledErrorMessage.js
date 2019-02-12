import PropTypes from 'prop-types';
import React from 'react';

// A visual UI element for an error message
export default function UnhandledErrorMessage({children, style}) {
  return <div style={{...styles.message, ...style}}>{children}</div>;
}
UnhandledErrorMessage.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object
};

const styles = {
  message: {
    backgroundColor: '#ff9b00',
    padding: 10,
    fontSize: 14
  }
};
