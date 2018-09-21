import React from 'react';
import PropTypes from 'prop-types';
import chroma from 'chroma-js';


// A clickable tab showing a key bit of information
export default function LightProfileTab(props) {
  const {
    isSelected,
    children,
    intenseColor,
    fadedColor,
    text,
    style,
    onClick
  } = props;


  return (
    <div
      className="LightProfileTab"
      style={{
        ...styles.root,
        background: fadedColor,
        opacity: (isSelected ? 1 : 0.6),
        ...style
      }}
      onClick={onClick}>
        <div style={{
          ...styles.title,
          opacity: isSelected ? 1 : 0.6,
          background: isSelected
            ? intenseColor
            : chroma(intenseColor).desaturate().hex()
        }}>{text}</div>
        <div
          style={{
            ...styles.space,
            background: fadedColor,
          }}>{children}</div>
    </div>
  );
}

LightProfileTab.propTypes = {
  children: PropTypes.node.isRequired,
  intenseColor: PropTypes.string.isRequired,
  fadedColor: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
  style: PropTypes.object
};

const styles = {
  root: {
    cursor: 'pointer',
    fontSize: 14
  },
  title:{
    width: '100%',
    textAlign: 'center',
    padding: 10,
    margin: 0,
    fontWeight: 'bold',
    color: 'white'
  },
  space: {
    flex: 1,
    padding: 10
  }
};


// A big number with subtext underneath, rendered inside a tab
export function LightShoutNumber(props) {
  const {number, children} = props;
  return (
    <div>
      <div style={{marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32}}>{number}</div>
      <div style={{color: '#333', display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        <div style={{textAlign: 'center'}}>{children}</div>
      </div>
    </div>
  );
}
LightShoutNumber.propTypes = {
  number: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired
};
