import React from 'react';
import PropTypes from 'prop-types';

export function Tab({text, orange, onClick}) {
  return (
    <div
      onClick={onClick}
      style={{
        ...styles.tab,
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
  onClick: PropTypes.func
};

export function NoInformation({style}) {
  return <Tab style={styles.none} text="No information" />;
}
NoInformation.propTypes = {
  style: PropTypes.object
};


const styles = {
  tab: {
    border: '1px solid #eee',
    margin: 5,
    marginLeft: 0,
    marginRight: 10,
    padding: 5,
    borderRadius: 1,
    height: '3em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    cursor: 'default',
    backgroundColor: '#eee'
  },
  clickable: {
    cursor: 'pointer'
  },
  orange: {
    backgroundColor: 'orange'
  },
  green: {
    backgroundColor: 'rgb(147, 196, 125)'
  }
};
