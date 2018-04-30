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
Button.propTypes = {
  children: React.PropTypes.node.isRequired,
  onClick: React.PropTypes.func.isRequired,
  style: React.PropTypes.object,
  hoverStyle: React.PropTypes.object
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
