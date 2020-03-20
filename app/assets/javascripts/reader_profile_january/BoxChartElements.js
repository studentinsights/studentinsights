import React from 'react';
import PropTypes from 'prop-types';
import chroma from 'chroma-js';
import {BLANK} from './colors';


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


export function Box({color, title, children}) {
  return <div title={title} style={boxStyle(color)}>{children}</div>;
}
Box.propTypes = {
  color: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};


function boxStyle(color, style = {}) {
  const boxStyle = {
    background: color,
    outline: `1px solid ${chroma(color).darken().hex()}`,
    color: muchDarkerColor(color).hex(),
    ...styles.boxStructure,
    ...style
  };

  // darken outline if blank
  if (color === BLANK) {
    return {
      ...boxStyle,
      color: muchDarkerColor(color).alpha(0.5).hex()
    };
  }

  return boxStyle;
}

function muchDarkerColor(color) {
  return chroma(color).darken().darken();
}


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
  },
  boxStructure: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    cursor: 'default'
  }
};
