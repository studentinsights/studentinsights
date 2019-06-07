import React from 'react';
import PropTypes from 'prop-types';
import {statsForDataPoint} from './ChipForFAndPEnglish';
import GenericDataPoints from './GenericDataPoints';


export default class FAndPDialog extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {gradeNow, benchmarkDataPoints} = this.props;
    const rows = benchmarkDataPoints.map(dataPoint => {
      return statsForDataPoint(dataPoint, gradeNow, nowFn());
    });

    return <GenericDataPoints rows={rows} />;
  }
}
FAndPDialog.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
FAndPDialog.propTypes = {
  gradeNow: PropTypes.string.isRequired,
  benchmarkDataPoints: PropTypes.array.isRequired
};

