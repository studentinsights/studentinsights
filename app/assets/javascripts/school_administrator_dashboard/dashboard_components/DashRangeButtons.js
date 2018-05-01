import React from 'react';
import PropTypes from 'prop-types';

import ToggleButton from '../../components/ToggleButton';


// For filtering across principal dashboards
class DashRangeButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state={selectedButton: 'fortyFiveDays'};
  }

  onClick(filterFunc, button) {
    filterFunc();
    this.setState({selectedButton: button});
  }

  render() {
    return (
      <div className="DashRangeButtons" style={styles.root}>
        <div style={styles.label}>Filter:</div>
        <div style={styles.filters}>
          <div style={styles.timeButtons}>
            <ToggleButton
              onClick={() => this.onClick(this.props.fortyFiveDayFilter, 'fortyFiveDays')}
              isSelected={this.state.selectedButton === 'fortyFiveDays'}>Past 45 Days</ToggleButton>
            <ToggleButton
              style={{borderLeft: 0}}
              onClick={() => this.onClick(this.props.ninetyDayFilter, 'ninetyDays')}
              isSelected={this.state.selectedButton === 'ninetyDays'}>Past 90 Days</ToggleButton>
            <ToggleButton
              style={{borderLeft: 0}}
              onClick={() => this.onClick(this.props.schoolYearFilter, 'schoolYear')}
              isSelected={this.state.selectedButton === 'schoolYear'}>This School Year</ToggleButton>
          </div>
        </div>
      </div>
    );
  }
}
DashRangeButtons.propTypes = {
  schoolYearFilter: PropTypes.func.isRequired,
  ninetyDayFilter: PropTypes.func.isRequired,
  fortyFiveDayFilter: PropTypes.func.isRequired
};

export default DashRangeButtons;


const styles = {
  root: {
    borderTop: '1px solid #ccc',
    borderBottom: '1px solid #ccc',
    padding: '10px 20px',
    margin: 20,
    display: 'flex',
    alignItems: 'center'
  },
  label: {
    paddingRight: 20
  },
  filters: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between'
  },
  timeButtons: {
    display: 'flex'
  }
};