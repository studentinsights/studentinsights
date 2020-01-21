import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import tabProptypes from './tabPropTypes';
import {adjustedGrade} from '../helpers/gradeText';
import {somervilleReadingThresholdsFor, DIBELS_FSF} from '../reading/thresholds';
import {benchmarkPeriodToMoment} from '../reading/readingData';
import {Tab} from './Tabs';

export default class FirstSoundFluencyTab extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {onClick, student, readerJson} = this.props;

    // Most recent data point
    const benchmarkDataPoints = readerJson.benchmark_data_points.filter(d => d.benchmark_assessment_key === DIBELS_FSF);
    console.log('benchmarkDataPoints', benchmarkDataPoints);
    const dataPoint = _.last(benchmarkDataPoints.map(dataPoint => {
      return benchmarkPeriodToMoment(dataPoint.benchmark_period_key, dataPoint.benchmark_school_year);
    }));

    if (!dataPoint) {
      return null;
    }
     /*
      <Tab
        text="First sound fluency"
        orange={true}
        onClick={onClick}
      />
    */

    // Format
    const gradeThen = adjustedGrade(dataPoint.benchmark_school_year, student.grade, nowFn());
    console.log('gradeThen', gradeThen);
    const thresholds = somervilleReadingThresholdsFor(...[
      dataPoint.benchmark_assessment_key,
      gradeThen,
      dataPoint.benchmark_period_key
    ]);
    console.log('thresholds', thresholds);
    const orange = (thresholds && thresholds.benchmark !== undefined)
      ? dataPoint.json.value < thresholds.benchmark
      : null;
    
    return (
      <Tab
        text="First sound fluency"
        orange={orange}
        onClick={onClick}
      />
    );
  }
}
FirstSoundFluencyTab.propTypes = tabProptypes;
FirstSoundFluencyTab.contextTypes = {
  nowFn: PropTypes.func.isRequired
};

