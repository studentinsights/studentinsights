import React from 'react';


// Visual UI component, the heading for a primary section on a page
function SectionHeading({children}) {
  return (
    <div className="SectionHeading" style={styles.root}>
      <h4 style={styles.title}>
        {children}
      </h4>
    </div>
  );
}
SectionHeading.propTypes = {
  children: React.PropTypes.node.isRequired
};

const styles = {
  root: {
    borderBottom: '1px solid #333',
    padding: 10
  },
  title: {
    display: 'inline',
    color: 'black'
  }
};

export default SectionHeading;
