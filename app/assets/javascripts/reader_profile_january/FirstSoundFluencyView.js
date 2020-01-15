import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import expandedViewPropTypes from './expandedViewPropTypes';
import ExpandedLayout from './ExpandedLayout';
import {adjustedGrade} from '../helpers/gradeText';
import {DIBELS_FSF} from '../reading/thresholds';
import {benchmarkPeriodToMoment} from '../reading/readingData';


export default class FirstSoundFluencyView extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {student, readerJson} = this.props;
    
    // Most recent data point
    // const benchmarkDataPoints = readerJson.benchmark_data_points.filter(d => d.benchmark_assessment_key === DIBELS_FSF);
    // const dataPoint = _.last(benchmarkDataPoints.map(dataPoint => {
    //   return benchmarkPeriodToMoment(dataPoint.benchmark_period_key, dataPoint.benchmark_school_year);
    // }));

    // // Format
    // const gradeThen = adjustedGrade(dataPoint.benchmark_school_year, student.grade, nowFn());
    // const materialKey = [gradeThen, dataPoint.benchmark_period_key].join('-');
    // const filename = URLS[materialKey];
    // const path = `/assets/reading/${filename}`;

    const path = `/assets/reading/FirstSoundFluency-K.1.jpg`;
    return (
      <ExpandedLayout
        titleText="First Sound Fluency"
        studentFirstName={student.first_name}
        materialsEl={<img
          width="100%"
          style={{border: '1px solid #ccc'}}
          src={path}
        />}
        strategiesEl="..."
        dataEl="..."
      />
    );
  }
}
FirstSoundFluencyView.propTypes = expandedViewPropTypes;
FirstSoundFluencyView.contextTypes = {
  nowFn: PropTypes.func.isRequired
};


const URLS = {
  'KF-fall': 'FirstSoundFluency-K.1.jpg',
  'KF-winter': 'FirstSoundFluency-K.2.jpg'
};

