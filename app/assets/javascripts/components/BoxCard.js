import PropTypes from 'prop-types';
import React from 'react';
import Card from './Card';


// A visual UI element for a boxy card of information, with a title.
// Does not have a defined or minimum height; style that in the child element.
export default function BoxCard({title, children, style = {}, className}) {
  return (
    <Card
      className={`BoxCard ${className || ''}`}
      style={{...styles.card, ...style}}>
      <div style={styles.cardTitle}>{title}</div>
      {children}
    </Card>
  );
}

BoxCard.propTypes = {
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object
};

const styles = {
  card: {
    margin: 20,
    padding: 0,
    flexDirection: 'column',
    display: 'flex'
  },
  cardTitle: {
    backgroundColor: '#eee',
    padding: 10,
    color: 'black',
    borderBottom: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'space-between'
  }
};
