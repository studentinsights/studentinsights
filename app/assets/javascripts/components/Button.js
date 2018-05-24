import PropTypes from 'prop-types';
import React from 'react';
import Hover from './Hover';


// A visual UI element for a button.  This is styled consistently with the `.btn` class
// defined in the server-side CSS.
export default function Button({children, onClick, style = {}, hoverStyle = {}}) {
  return (
    <Hover>
      {isHovering => {
        const mergedStyle = {
          ...styles.button,
          ...style,
          ...(isHovering ? styles.hover : {}),
          ...(isHovering ? hoverStyle : {})
        };
        return <button onClick={onClick} style={mergedStyle}>{children}</button>;
      }}
    </Hover>
  );
}
const propTypes = Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  style: PropTypes.object,
  hoverStyle: PropTypes.object
};

const styles = {
  button: {
    borderRadius: 28,
    color: 'white',
    fontSize: 14,
    background: '#4A90E2',
    padding: '8px 25px',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer'
  },
  hover: {
    background: '#2275d7',
  }
};


// Red for a serious kind of action (submit, delete).
export function SeriousButton(props) {
  const mergedProps = {
    ...props,
    style: {
      ...(props.style || {}),
      backgroundColor: '#E5370E'
    },
    hoverStyle: {
      ...(props.hoverStyle || {}),
      backgroundColor: '#b52b0b'
    }
  };

  return <Button {...mergedProps} />;
}
SeriousButton.propTypes = propTypes;