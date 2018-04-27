import React from 'react';
import PropTypes from 'prop-types';

import DashButton from './DashButton';

//Custom all purpose dashboard button
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
      <div className="DashRangeButtonWrapper">
        <div className="DashRangeButtons">
          Filter:
          <DashButton
              onClick={() => this.onClick(this.props.fortyFiveDayFilter, 'fortyFiveDays')}
              isSelected={this.state.selectedButton === 'fortyFiveDays'}
              buttonText='Past 45 Days' />
          <DashButton
              onClick={() => this.onClick(this.props.ninetyDayFilter, 'ninetyDays')}
              isSelected={this.state.selectedButton === 'ninetyDays'}
              buttonText='Past 90 Days' />
          <DashButton
            onClick={() => this.onClick(this.props.schoolYearFilter, 'schoolYear')}
            isSelected={this.state.selectedButton === 'schoolYear'}
            buttonText='This School Year' />
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
