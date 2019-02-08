import PropTypes from 'prop-types';
import React from 'react';
import BreakdownBar from '../components/BreakdownBar';
import {
  high,
  medium,
  low
} from '../helpers/colors';

// Visual component showing a horizontal bar broken down into three colors
// showing percent of students at different DIBELS levels.
export default class DibelsBreakdownBar extends React.Component {
  items() {
    const {coreCount, strategicCount, intensiveCount} = this.props;
    return [
      { left: 0, width: coreCount, color: high, key: 'core' },
      { left: coreCount, width: strategicCount, color: medium, key: 'strategic' },
      { left: coreCount + strategicCount, width: intensiveCount, color: low, key: 'intensive' }
    ];
  }

  itemsFlipped() {
    const {coreCount, strategicCount, intensiveCount} = this.props;
    return [
      { left: 0, width: intensiveCount, color: low, key: 'intensive' },
      { left: intensiveCount, width: strategicCount, color: medium, key: 'strategic' },
      { left: intensiveCount + strategicCount, width: coreCount, color: high, key: 'core' }
    ];
  }

  render() {
    const {isFlipped} = this.props;
    const items = isFlipped ? this.itemsFlipped() : this.items();
    return <BreakdownBar items={items} {...this.props} />;
  }
}

DibelsBreakdownBar.propTypes = {
  coreCount: PropTypes.number.isRequired,
  strategicCount: PropTypes.number.isRequired,
  intensiveCount: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  labelTop: PropTypes.number.isRequired,
  style: PropTypes.object,
  innerStyle: PropTypes.object,
  isFlipped: PropTypes.bool
};
