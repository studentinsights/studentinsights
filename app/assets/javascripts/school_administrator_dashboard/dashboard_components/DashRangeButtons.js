import React from 'react';
import PropTypes from 'prop-types';

import DashButton from './DashButton';

//Custom all purpose dashboard button
class DashRangeButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state={selectedButton: 'schoolYear'};
  }

  onClick(filterFunc, button) {
    filterFunc();
    this.setState({selectedButton: button});
  }

  render() {
    return (
      <div className="DashRangeButtons">
        <DashButton
          onClick={() => this.onClick(this.props.schoolYearFilter, 'schoolYear')}
          isSelected={this.state.selectedButton === 'schoolYear'}
          buttonText={'School Year'}/>
      <DashButton
          onClick={() => this.onClick(this.props.ninetyDayFilter, 'ninetyDays')}
          isSelected={this.state.selectedButton === 'ninetyDays'}
          buttonText={'90 Days'}/>
      <DashButton
          onClick={() => this.onClick(this.props.fortyFiveDayFilter, 'fortyFiveDays')}
          isSelected={this.state.selectedButton === 'fortyFiveDays'}
          buttonText={'45 Days'}/>
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
