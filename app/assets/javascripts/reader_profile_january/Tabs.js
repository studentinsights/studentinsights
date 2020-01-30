import React from 'react';
import PropTypes from 'prop-types';
import {ORANGE, GREEN, PRESENT, BLANK} from './colors';


// <Tab /> should only be used when there is data that can be expanded.
// `orange` determines highlighting (true|false|null).
// 
// If there's no data, use <NoInformation /> instead, although
// see the layout page for more.
export function Tab({text, orange, onClick, style = {}}) {
  return (
    <div
      className="Tab"
      onClick={onClick}
      style={{
        ...styles.tab,
        ...style,
        ...(onClick ? styles.clickable : {}),
        ...(orange === true ? styles.orange : {}),
        ...(orange === false ? styles.green : {})
      }}>
      {text}
    </div>
  );
}
Tab.propTypes = {
  text: PropTypes.string.isRequired,
  orange: PropTypes.bool, // false different than null/undefined
  style: PropTypes.object,
  onClick: PropTypes.func
};

export function NoInformation({style}) {
  return <Tab style={styles.none} text="Ask teacher" />;
}
NoInformation.propTypes = {
  style: PropTypes.object
};


const styles = {
  tab: {
    border: '1px solid #f8f8f8',
    margin: 5,
    marginLeft: 0,
    marginRight: 10,
    padding: 5,
    paddingLeft: 10,
    borderRadius: 1,
    height: '3em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    cursor: 'default',
    backgroundColor: PRESENT
  },
  none: {
    backgroundColor: BLANK,
    color: '#999',
    opacity: 0.5
  },
  clickable: {
    cursor: 'pointer'
  },
  orange: {
    backgroundColor: ORANGE,
  },
  green: {
    backgroundColor: GREEN
  }
};
