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
import {
  interpretFAndPEnglish,
  classifyFAndPEnglish
} from '../reading/readingData';

// Visual component showing a horizontal bar broken down into three colors
// showing percent of students at different F&P levels.
export default class FountasAndPinnellBreakdown extends React.Component {
  items() {
    const {grade, benchmarkPeriodKey, fAndPValuesWithNulls, includeMissing, additionalMissingCount} = this.props;
    const fAndPCounts = {
      low: 0,
      medium: 0,
      high: 0,
      missing: additionalMissingCount
    };
    function tickMissing() {
      fAndPCounts.missing = fAndPCounts.missing + 1;
    }
    fAndPValuesWithNulls.forEach(maybeFAndP => {
      if (!maybeFAndP) return tickMissing();
      const level = interpretFAndPEnglish(maybeFAndP);
      if (!level) return tickMissing();
      const category = classifyFAndPEnglish(level, grade, benchmarkPeriodKey);
      if (!category) return tickMissing();
      fAndPCounts[category] = fAndPCounts[category] + 1;
    });

    const missingItem = (includeMissing)
      ? { left: 0, width: fAndPCounts.missing, color: missing, key: 'missing' }
      : null;
    const missingCountOrZero = (includeMissing)
      ? fAndPCounts.missing
      : 0;
    return _.compact([
      missingItem,
      { left: missingCountOrZero, width: fAndPCounts.high, color: high, key: 'high' },
      { left: missingCountOrZero + fAndPCounts.high, width: fAndPCounts.medium, color: medium, key: 'medium' },
      { left: missingCountOrZero + fAndPCounts.high + fAndPCounts.medium, width: fAndPCounts.low, color: low, key: 'low' }
    ]);
  }


  render() {
    const items = this.items();
    return <BreakdownBar items={items} {...this.props} />;
  }
}

FountasAndPinnellBreakdown.propTypes = {
  benchmarkPeriodKey: PropTypes.string.isRequired,
  grade: PropTypes.string.isRequired,
  fAndPValuesWithNulls: PropTypes.arrayOf(PropTypes.string).isRequired,
  height: PropTypes.number.isRequired,
  labelTop: PropTypes.number.isRequired,
  style: PropTypes.object,
  innerStyle: PropTypes.object,
  includeMissing: PropTypes.bool,
  additionalMissingCount: PropTypes.number
};
FountasAndPinnellBreakdown.defaultProps = {
  additionalMissingCount: 0
};