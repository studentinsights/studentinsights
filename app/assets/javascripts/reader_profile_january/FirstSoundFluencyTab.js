import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import tabProptypes from './tabPropTypes';
import {adjustedGrade} from '../helpers/gradeText';
import {somervilleReadingThresholdsFor, DIBELS_FSF} from '../reading/thresholds';
import {benchmarkPeriodToMoment} from '../reading/readingData';
import {Tab, NoInformation} from './Tabs';

export default class FirstSoundFluencyTab extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {onClick, student, readerJson} = this.props;

    // Most recent data point
    const benchmarkDataPoints = readerJson.benchmark_data_points.filter(d => d.benchmark_assessment_key === DIBELS_FSF);
    const dataPoint = _.last(benchmarkDataPoints.map(dataPoint => {
      return benchmarkPeriodToMoment(dataPoint.benchmark_period_key, dataPoint.benchmark_school_year);
    }));

    if (!dataPoint) {
      return (
        <Tab
          text="First sound fluency"
          orange={true}
          onClick={onClick}
        />
      );
    }

    // Format
    const gradeThen = adjustedGrade(dataPoint.benchmark_school_year, student.grade, nowFn());
    const {benchmark} = somervilleReadingThresholdsFor(...[
      dataPoint.benchmark_assessment_key,
      gradeThen,
      dataPoint.benchmark_period_key
    ]);
    
    return (
      <Tab
        text="First sound fluency"
        orange={dataPoint.json.value < benchmark}
        onClick={onClick}
      />
    );
  }
}
FirstSoundFluencyTab.propTypes = tabProptypes;
FirstSoundFluencyTab.contextTypes = {
  nowFn: PropTypes.func.isRequired
};

