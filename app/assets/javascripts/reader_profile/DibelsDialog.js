import React from 'react';
import PropTypes from 'prop-types';
import {statsForDataPoint} from './ChipForDibels';
import GenericDataPoints from './GenericDataPoints';


export default class DibelsDialog extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {gradeNow, benchmarkDataPoints} = this.props;
    const rows = benchmarkDataPoints.map(dataPoint => {
      return statsForDataPoint(dataPoint, gradeNow, nowFn());
    });

    return <GenericDataPoints rows={rows} />;
  }
}
DibelsDialog.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
DibelsDialog.propTypes = {
  gradeNow: PropTypes.string.isRequired,
  benchmarkDataPoints: PropTypes.array.isRequired
};
