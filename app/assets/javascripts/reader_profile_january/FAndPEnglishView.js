import React from 'react';
import {F_AND_P_ENGLISH} from '../reading/thresholds';
import {interpretFAndPEnglish} from '../reading/fAndPInterpreter';
import {COMPREHENSION} from './instructionalStrategies';
import {matchStrategies} from './instructionalStrategies';
import {mostRecentDataPoint} from './dibelsParsing';
import expandedViewPropTypes from './expandedViewPropTypes';
import ExpandedLayout from './ExpandedLayout';
import MaterialsCarousel from './MaterialsCarousel';
import Strategies from './Strategies';
import Data from './Data';


const benchmarkAssessmentKey = F_AND_P_ENGLISH;
export default class FAndPEnglishView extends React.Component {
  render() {
    const {student, onClose} = this.props;

    return (
      <ExpandedLayout
        titleText="F&P English"
        studentFirstName={student.first_name}
        materialsEl={this.renderMaterials()}
        strategiesEl={this.renderStrategies()}
        dataEl={this.renderData()}
        onClose={onClose}
      />
    );
  }

  renderStrategies() {
    const {student, instructionalStrategies} = this.props;
    const strategies = matchStrategies(instructionalStrategies, student.grade, COMPREHENSION);
    return <Strategies strategies={strategies} />;
  }

  // This is a bit different than others, since the materials are different depending
  // on the level, not the time of year or student's grade level.  So here we show
  // the materials of the students' instructional level.
  renderMaterials() {
    const {readerJson} = this.props;
    const dataPoint = mostRecentDataPoint(readerJson, benchmarkAssessmentKey);
    if (!dataPoint) return null;
    const level = interpretFAndPEnglish(dataPoint.json.value);
    if (!level) return null;
    const fileKeys = MATERIAL_URLS[level];
    if (!fileKeys) return null;

    return <MaterialsCarousel fileKeys={fileKeys} />;
  }

  renderData() {
    const {student, readerJson} = this.props;
    return (
      <Data
        studentId={student.id}
        gradeNow={student.grade}
        readerJson={readerJson}
        benchmarkAssessmentKey={benchmarkAssessmentKey}
      />
    );
  }
}
FAndPEnglishView.propTypes = expandedViewPropTypes;


const MATERIAL_URLS = {
  'A': ['FP-A1-cover', 'FP-A1-page', 'FP-A2-cover', 'FP-A2-page'],
  'B': ['FP-B1-cover', 'FP-B1-page', 'FP-B2-cover', 'FP-B2-page']
};


