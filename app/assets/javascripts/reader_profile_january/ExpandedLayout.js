import React from 'react';
import PropTypes from 'prop-types';

export default class ExpandedLayout extends React.Component {
  render() {
    const {
      titleText,
      studentFirstName,
      onClose,
      materialsEl,
      strategiesEl,
      dataEl
    } = this.props;

    return (
      <div style={styles.root}>
        <div style={styles.header}>
          <div style={styles.title}>{titleText}</div>
          <div onClick={onClose} style={styles.close}>Close</div>
        </div>
        <div style={styles.columns}>
          <div style={{...styles.column, ...styles.materials}}>
            <div>{materialsEl}</div>
          </div>
          <div style={{...styles.column, ...styles.strategies}}>
            <div style={styles.subtitle}>Instructional strategies</div>
            <div>{strategiesEl}</div>
          </div>
          <div style={{...styles.column, ...styles.data}}>
            <div style={styles.subtitle}>Data for {studentFirstName}</div>
            <div>{dataEl}.</div>
          </div>
        </div>
      </div>
    );
  }
}
ExpandedLayout.propTypes = {
  titleText: PropTypes.string.isRequired,
  studentFirstName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  materialsEl: PropTypes.node.isRequired,
  strategiesEl: PropTypes.node.isRequired,
  dataEl: PropTypes.node.isRequired
};


const styles = {
  root: {
    padding: 10
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16
  },
  close: {
    color: '#999',
    cursor: 'pointer'
  },
  columns: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  column: {
    marginRight: 20
  },
  materials: {
    flex: 5
  },
  strategies: {
    flex: 3
  },
  data: {
    flex: 5
  },
  subtitle: {
    color: '#333',
    marginBottom: 10
  }
};
