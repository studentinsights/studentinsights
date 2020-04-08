import React from 'react';
import {F_AND_P_ENGLISH} from '../reading/thresholds';
import {mostRecentDataPointFor} from '../reading/readingData';
import {COMPREHENSION} from './instructionalStrategies';
import {matchStrategies} from './instructionalStrategies';
import expandedViewPropTypes from './expandedViewPropTypes';
import ExpandedLayout from './ExpandedLayout';
import Strategies from './Strategies';
import Data from './Data';
import FAndPMaterials from './FAndPMaterials';


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
    const dataPoint = mostRecentDataPointFor(readerJson.benchmark_data_points, benchmarkAssessmentKey);
    if (!dataPoint) return null;
    return <FAndPMaterials rawLevelText={dataPoint.json.value} />;
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

