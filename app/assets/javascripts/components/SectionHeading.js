import PropTypes from 'prop-types';
import React from 'react';


// Visual UI component, the heading for a primary section on a page
export default function SectionHeading({children,  style = {}, titleStyle = {}}) {
  return (
    <div className="SectionHeading" style={{...styles.root, ...style}}>
      <h4 style={{...styles.title, ...titleStyle}}>
        {children}
      </h4>
    </div>
  );
}
SectionHeading.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
  titleStyle: PropTypes.object
};

const styles = {
  root: {
    borderBottom: '1px solid #333',
    padding: 10
  },
  title: {
    display: 'inline',
    color: 'black'
  },
  spaceBetweenHeading: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
};

export function SectionHeadingSpaceBetween(props) {
  return <SectionHeading {...props} titleStyle={styles.spaceBetweenHeading} />;
}