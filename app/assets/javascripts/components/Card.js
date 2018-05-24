import PropTypes from 'prop-types';
import React from 'react';

// A visual UI element for a card of information, generically.
// Does not have a defined or minimum height; style that in the child element.
function Card({children, style, className}) {
  return <div
    className={`Card ${className || ''}`}
    style={{...styles.card, ...style}}>{children}</div>;
}
Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object
};

const styles = {
  card: {
    padding: 10,
    border: '1px solid #ccc',
    borderRadius: 3
  }
};

export default Card;
