import React from 'react';


// Visual UI component, the heading for a primary section on a page
function SectionHeading({children, style = {}, titleStyle = {}}) {
  return (
    <div className="SectionHeading" style={{...styles.root, ...style}}>
      <h4 style={{...styles.title, ...titleStyle}}>
        {children}
      </h4>
    </div>
  );
}
SectionHeading.propTypes = {
  children: React.PropTypes.node.isRequired,
  style: React.PropTypes.object,
  titleStyle: React.PropTypes.object
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
