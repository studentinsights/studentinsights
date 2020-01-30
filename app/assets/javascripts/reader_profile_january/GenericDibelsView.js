import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {adjustedGrade} from '../helpers/gradeText';
import {benchmarkPeriodToMoment} from '../reading/readingData';
import expandedViewPropTypes from './expandedViewPropTypes';
import {matchStrategies} from './instructionalStrategies';
import {mostRecentDataPoint} from './dibelsParsing';
import ExpandedLayout from './ExpandedLayout';
import MaterialsCarousel from './MaterialsCarousel';
import Strategies from './Strategies';
import GenericDibelsDataPoint from './GenericDibelsDataPoint';

export default class GenericDibelsView extends React.Component {
  render() {
    const {titleText} = this.props;    
    const {student, onClose} = this.props;

    return (
      <ExpandedLayout
        titleText={titleText}
        studentFirstName={student.first_name}
        materialsEl={this.renderMaterials()}
        strategiesEl={this.renderStrategies()}
        dataEl={this.renderData()}
        onClose={onClose}
      />
    );
  }

  renderStrategies() {
    const {categoryKey, student, instructionalStrategies} = this.props;
    const strategies = matchStrategies(instructionalStrategies, student.grade, categoryKey);
    return <Strategies strategies={strategies} />;
  }

  renderMaterials() {
    const {nowFn} = this.context;
    const {student, readerJson, benchmarkAssessmentKey, urls} = this.props;
    const dataPoint = mostRecentDataPoint(readerJson, benchmarkAssessmentKey);
    if (!dataPoint) return null;

    const gradeThen = adjustedGrade(dataPoint.benchmark_school_year, student.grade, nowFn());
    const fileKeys = materialsFileKeys(dataPoint, gradeThen, urls);
    return <MaterialsCarousel fileKeys={fileKeys} />;
  }

  renderData(gradeThen) {
    const {nowFn} = this.context;
    const {student, readerJson, benchmarkAssessmentKey} = this.props;
    const dataPoints = readerJson.benchmark_data_points.filter(d => d.benchmark_assessment_key === benchmarkAssessmentKey);
    const sortedDataPoints = _.sortBy(dataPoints, dataPoint => {
      return -1 * benchmarkPeriodToMoment(dataPoint.benchmark_period_key, dataPoint.benchmark_school_year).unix();
    });
    return (
      <div>
        {sortedDataPoints.map(dataPoint => {
          const gradeThen = adjustedGrade(dataPoint.benchmark_school_year, student.grade, nowFn());
          return (
            <GenericDibelsDataPoint
              key={dataPoint.id}
              dataPoint={dataPoint}
              gradeThen={gradeThen}
            />
          );
        })}
      </div>
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