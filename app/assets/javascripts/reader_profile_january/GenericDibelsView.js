import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {adjustedGrade} from '../helpers/gradeText';
import expandedViewPropTypes from './expandedViewPropTypes';
import {matchStrategies} from './instructionalStrategies';
import {mostRecentDataPoint} from './dibelsParsing';
import ExpandedLayout from './ExpandedLayout';
import MaterialsCarousel from './MaterialsCarousel';
import Strategies from './Strategies';



export default class GenericDibelsView extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {titleText, urls, categoryKey, benchmarkAssessmentKey} = this.props;    
    const {student, readerJson, instructionalStrategies, onClose} = this.props;
    const dataPoint = mostRecentDataPoint(readerJson, benchmarkAssessmentKey);
    const fileKeys = materialsFileKeys(dataPoint, student.grade, nowFn(), urls);
    const strategies = matchStrategies(instructionalStrategies, student.grade, categoryKey);
    console.log('strategies for:', categoryKey, 'from:', instructionalStrategies, 'are:', strategies);
    return (
      <ExpandedLayout
        titleText={titleText}
        studentFirstName={student.first_name}
        materialsEl={<MaterialsCarousel fileKeys={fileKeys} />}
        strategiesEl={<Strategies strategies={strategies} />}
        dataEl="..."
        onClose={onClose}
      />
    );
  }
}
GenericDibelsView.propTypes = {
  ...expandedViewPropTypes,
  categoryKey: PropTypes.string.isRequired,
  benchmarkAssessmentKey: PropTypes.string.isRequired,
  urls: PropTypes.object.isRequired,
  titleText: PropTypes.string.isRequired
};
GenericDibelsView.contextTypes = {
  nowFn: PropTypes.func.isRequired
};


function materialsFileKeys(dataPoint, gradeNow, nowMoment, urls) {
  const gradeThen = adjustedGrade(dataPoint.benchmark_school_year, gradeNow, nowMoment);
  const materialKey = [gradeThen, dataPoint.benchmark_period_key].join('-');
  return _.compact([urls[materialKey]]);
}