import React from 'react';
import expandedViewPropTypes from './expandedViewPropTypes';

export default class FirstSoundFluencyView extends React.Component {
  render() {
    const {student} = this.props;

    const materialsEl = (
      <img
        width="100%"
        style={{border: '1px solid #ccc'}}
        src="/assets/reading/FirstSoundFluency-k.jpg"
      />
    );
    return (
      <div style={styles.root}>
        <div style={styles.header}>
          <div style={styles.title}>First Sound Fluency</div>
          <div style={styles.close}>Close</div>
        </div>
        <div style={styles.columns}>
          <div style={{...styles.column, ...styles.materials}}>
            <div>{materialsEl}</div>
          </div>
          <div style={{...styles.column, ...styles.strategies}}>
            <div style={styles.subtitle}>Instructional strategies</div>
            <div>...strategies...</div>
          </div>
          <div style={{...styles.column, ...styles.data}}>
            <div style={styles.subtitle}>Data for {student.first_name}</div>
            <div>...data...</div>
          </div>
        </div>
      </div>
    );
  }
}
FirstSoundFluencyView.propTypes = expandedViewPropTypes;

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
    color: '#999'
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