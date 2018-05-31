import React from 'react';
import BreakdownBar from '../components/BreakdownBar';
import {
  high,
  medium,
  low
} from '../helpers/colors.js';

// Visual component showing a horizontal bar broken down into three colors
// showing percent of students at different DIBELS levels.
export default class DibelsBreakdownBar extends React.Component {
  render() {
    const {coreCount, strategicCount, intensiveCount} = this.props;
    const items = [
      { left: 0, width: coreCount, color: high, key: 'core' },
      { left: coreCount, width: strategicCount, color: medium, key: 'strategic' },
      { left: coreCount + strategicCount, width: intensiveCount, color: low, key: 'intensive' }
    ];

    return <BreakdownBar items={items} {...this.props} />;
  }
}

DibelsBreakdownBar.propTypes = {
  coreCount: React.PropTypes.number.isRequired,
  strategicCount: React.PropTypes.number.isRequired,
  intensiveCount: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  labelTop: React.PropTypes.number.isRequired,
  style: React.PropTypes.object,
  innerStyle: React.PropTypes.object
};
