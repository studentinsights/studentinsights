import React from 'react';
import PropTypes from 'prop-types';


// A visual component for toggling a button on or off.  May be used
// in a button strip.
export default function ToggleButton(props) {
  const {isSelected, onClick, children, style = {}, selectedStyle = {}} = props;
  const mergedStyles = {
    ...styles.button,
    ...style,
    ...(isSelected ? styles.selectedStyle : {}),
    ...(isSelected ? selectedStyle : {})
  };
  return (
    <div className="ToggleButton">
      <button
        style={mergedStyles}
        onClick={onClick}>
        {children}
      </button>
    </div>
  );
}

ToggleButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
  selectedStyle: PropTypes.object
};

const styles = {
  button: {
    cursor: 'pointer',
    border: '1px solid #ccc',
    // borderRadius: 3,
    display: 'flex',
    fontSize: 14,
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    justifyContent: 'center',
    backgroundColor: '#eee',
    color: 'black'
  },
  selectedStyle: {
    backgroundColor: '#4A90E2',
    border: '1px solid #4A90E2',
    color: 'white'
  }
};
