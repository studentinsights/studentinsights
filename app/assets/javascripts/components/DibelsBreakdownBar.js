import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import BreakdownBar from '../components/BreakdownBar';
import {
  high,
  medium,
  low,
  missing
} from '../helpers/colors';

// Visual component showing a horizontal bar broken down into three colors
// showing percent of students at different DIBELS levels.
export default class DibelsBreakdownBar extends React.Component {
  items() {
    const {coreCount, strategicCount, intensiveCount, missingCount} = this.props;
    const missingItem = (_.isNumber(missingCount)) ? { left: 0, width: missingCount, color: missing, key: 'missing' } : null;
    const missingCountOrZero = missingCount || 0;
    return _.compact([
      missingItem,
      { left: missingCountOrZero, width: coreCount, color: high, key: 'core' },
      { left: missingCountOrZero + coreCount, width: strategicCount, color: medium, key: 'strategic' },
      { left: missingCountOrZero + coreCount + strategicCount, width: intensiveCount, color: low, key: 'intensive' }
    ]);
  }

  itemsFlipped() {
    const {coreCount, strategicCount, intensiveCount, missingCount} = this.props;
    const missingItem = (_.isNumber(missingCount)) ? { left: 0, width: missingCount, color: missing, key: 'missing' } : null;
    const missingCountOrZero = missingCount || 0;

    return _.compact([
      missingItem,
      { left: missingCountOrZero, width: intensiveCount, color: low, key: 'intensive' },
      { left: missingCountOrZero + intensiveCount, width: strategicCount, color: medium, key: 'strategic' },
      { left: missingCountOrZero + intensiveCount + strategicCount, width: coreCount, color: high, key: 'core' }
    ]);
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
  missingCount: PropTypes.number,
  height: PropTypes.number.isRequired,
  labelTop: PropTypes.number.isRequired,
  style: PropTypes.object,
  innerStyle: PropTypes.object,
  isFlipped: PropTypes.bool
};
