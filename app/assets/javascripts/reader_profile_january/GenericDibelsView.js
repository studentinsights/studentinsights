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
import GenericDibelsDataPoint from './GenericDibelsDataPoint';

export default class GenericDibelsView extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {titleText, urls, categoryKey, benchmarkAssessmentKey} = this.props;    
    const {student, readerJson, instructionalStrategies, onClose} = this.props;
    const dataPoint = mostRecentDataPoint(readerJson, benchmarkAssessmentKey);
    const gradeThen = adjustedGrade(dataPoint.benchmark_school_year, student.grade, nowFn());
    const fileKeys = materialsFileKeys(dataPoint, gradeThen, urls);
    const strategies = matchStrategies(instructionalStrategies, student.grade, categoryKey);
    return (
      <ExpandedLayout
        titleText={titleText}
        studentFirstName={student.first_name}
        materialsEl={<MaterialsCarousel fileKeys={fileKeys} />}
        strategiesEl={<Strategies strategies={strategies} />}
        dataEl={<GenericDibelsDataPoint dataPoint={dataPoint} gradeThen={gradeThen} />}
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


function materialsFileKeys(dataPoint, gradeThen, urls) {
  if (dataPoint === null || dataPoint === undefined) return [];
  const materialKey = [gradeThen, dataPoint.benchmark_period_key].join('-');
  return _.compact([urls[materialKey]]);
}