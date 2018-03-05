import React from 'react';


// A visual UI element for a card of information, generically.
// Does not have a defined or minimum height; style that in the child element.
function Card({children, style}) {
  return <div className="Card" style={{...styles.card, ...style}}>{children}</div>;
}
Card.propTypes = {
  children: React.PropTypes.node.isRequired,
  style: React.PropTypes.object
};

const styles = {
  card: {
    padding: 10,
    border: '1px solid #ccc',
    borderRadius: 3
  }
};

export default Card;