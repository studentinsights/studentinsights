import PropTypes from 'prop-types';
import React from 'react';


// A visual UI element showing a successful message.
export default function SuccessLabel({text, style}) {
  const mergedStyle = {
    ...styles.successLabel,
    ...style
  };
  return <span className="SuccessLabel" style={mergedStyle}>{text}</span>;
}
SuccessLabel.propTypes = {
  text: PropTypes.string.isRequired,
  style: PropTypes.object
};

const styles = {
  successLabel: {
    fontWeight: 'bold',
    backgroundColor: 'rgb(209, 231, 210)',
    color: 'green',
    padding: 8,
    border: '1px solid rgb(149, 198, 150)',
    borderRadius: 3
  }
};