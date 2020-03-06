import React from 'react';
import PropTypes from 'prop-types';


export function BoxChartContainer({children}) {
  return <div className="BoxChartContainer" style={styles.years}>{children}</div>;
}
BoxChartContainer.propTypes = {
  children: PropTypes.node.isRequired
};


export function YearBoxContainer({periodEls, captionEl, style = {}}) {
  return (
    <div className="YearBoxContainer" style={{...styles.yearBox, ...style}}>
      <div style={styles.yearCells}>
        {periodEls}
      </div>
      <div style={styles.yearWhen}>{captionEl}</div>
    </div>
  );
}
YearBoxContainer.propTypes = {
  periodEls: PropTypes.arrayOf(PropTypes.node).isRequired,
  captionEl: PropTypes.node.isRequired,
  style: PropTypes.object
};


export const boxStructureStyle = {
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 40,
  cursor: 'default'
};



const styles = {
  years: {
    display: 'flex',
    flexDirection: 'row',
    fontSize: 12
  },
  yearBox: {
    flex: 1
  },
  yearCells: {
    display: 'flex',
    flexDirection: 'row'
  },
  yearWhen: {
    marginTop: 5
  }
};
