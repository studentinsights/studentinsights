import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import tabProptypes from './tabPropTypes';
import {adjustedGrade} from '../helpers/gradeText';
import {somervilleReadingThresholdsFor, DIBELS_FSF} from '../reading/thresholds';
import {benchmarkPeriodToMoment} from '../reading/readingData';


export default class FirstSoundFluencyTab extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {student, readerJson} = this.props;

    // Most recent data point
    const benchmarkDataPoints = readerJson.benchmark_data_points.filter(d => d.benchmark_assessment_key === DIBELS_FSF);
    const dataPoint = _.last(benchmarkDataPoints.map(dataPoint => {
      return benchmarkPeriodToMoment(dataPoint.benchmark_period_key, dataPoint.benchmark_school_year);
    }));

    if (!dataPoint) {
      return <div style={{backgroundColor: 'grey'}}>No information</div>;
    }

    // Format
    const gradeThen = adjustedGrade(dataPoint.benchmark_school_year, student.grade, nowFn());
    const {benchmark} = somervilleReadingThresholdsFor(...[
      dataPoint.benchmark_assessment_key,
      gradeThen,
      dataPoint.benchmark_period_key
    ]);
    const backgroundColor = (dataPoint.json.value < benchmark)
      ? 'orange'
      : 'green';

    
    return <div style={backgroundColor}>First sound fluency</div>;
  }
}
FirstSoundFluencyTab.propTypes = tabProptypes;
FirstSoundFluencyTab.contextTypes = {
  nowFn: PropTypes.func.isRequired
};


