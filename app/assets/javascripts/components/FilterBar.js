import React from 'react';
import PropTypes from 'prop-types';


// A UI component, for a label and spacing and alignment on filter bars (Select components
// running horizontally across the page).
export default function FilterBar(props) {
  const {children, style, barStyle, labelText} = props;

  return (
    <div className="FilterBar" style={style}>
      <div style={{...styles.bar, ...barStyle}}>
        <span style={styles.label}>{labelText || 'Filter by'}</span>
        {children}
      </div>
    </div>
  );
}
FilterBar.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
  barStyle: PropTypes.object,
  labelText: PropTypes.string
};

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center'
  },
  label: {
    display: 'inline-block',
    marginBottom: 4, // fudging vertical alignment
    marginRight: 10
  }
};
