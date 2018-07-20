import React from 'react';
import PropTypes from 'prop-types';
import DashButton from './DashButton';


export default class DashRangeButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state={selectedButton: props.defaultSelectedButton || 'schoolYear'};
  }

  onClick(filterFunc, button) {
    filterFunc();
    this.setState({selectedButton: button});
  }

  render() {
    return (
      <div className="DashRangeButtons" style={styles.root}>
        <span>Filter:</span>
        <DashButton
            onClick={() => this.onClick(this.props.fortyFiveDayFilter, 'fortyFiveDays')}
            isSelected={this.state.selectedButton === 'fortyFiveDays'}
            buttonText='Last 45 Days' />
        <DashButton
            onClick={() => this.onClick(this.props.ninetyDayFilter, 'ninetyDays')}
            isSelected={this.state.selectedButton === 'ninetyDays'}
            buttonText='Last 90 Days' />
        <DashButton
          onClick={() => this.onClick(this.props.schoolYearFilter, 'schoolYear')}
          isSelected={this.state.selectedButton === 'schoolYear'}
          buttonText='School Year' />
      </div>
    );
  }
}
DashRangeButtons.propTypes = {
  schoolYearFilter: PropTypes.func.isRequired,
  ninetyDayFilter: PropTypes.func.isRequired,
  fortyFiveDayFilter: PropTypes.func.isRequired,
  defaultSelectedButton: PropTypes.string
};

const styles = {
  root: {
    display: 'flex',
    alignItems: 'center'
  }
};