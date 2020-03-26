import React from 'react';
import PropTypes from 'prop-types';
import {gradeText} from '../helpers/gradeText';
import BenchmarkBoxChart, {renderDibelsBoxFn, renderRawDibelsScoreBoxFn} from './BenchmarkBoxChart';
import Expandable from './Expandable';
import BenchmarkCohortChart from './BenchmarkCohortChart';


export default class Data extends React.Component {
  render() {
    return (
      <div className="Data">
        <div style={styles.mainBox}>
          {this.renderBoxChart()}
        </div>
        <div>
          {this.renderCohort()}
          {this.renderExpandableRawScores()}
        </div>
      </div>
    );
  }

  renderBoxChart() {
    const {gradeNow, readerJson, benchmarkAssessmentKey} = this.props;
    return (
      <BenchmarkBoxChart
        gradeNow={gradeNow}
        readerJson={readerJson}
        benchmarkAssessmentKey={benchmarkAssessmentKey}
        renderBoxFn={renderDibelsBoxFn}
      />
    );
  }

  renderCohort() {
    const {studentId, gradeNow, readerJson, benchmarkAssessmentKey} = this.props;
    return (
      <Expandable text={`Percentile in ${gradeText(gradeNow)} school cohort`}>
        <BenchmarkCohortChart
          studentId={studentId}
          gradeNow={gradeNow}
          readerJson={readerJson}
          benchmarkAssessmentKey={benchmarkAssessmentKey}
        />
      </Expandable>
    );
  }

  renderExpandableRawScores() {
    const {gradeNow, readerJson, benchmarkAssessmentKey} = this.props;
    return (
      <Expandable text="Raw scores">
        <BenchmarkBoxChart
          gradeNow={gradeNow}
          readerJson={readerJson}
          benchmarkAssessmentKey={benchmarkAssessmentKey}
          renderBoxFn={renderRawDibelsScoreBoxFn}
        />
      </Expandable>
    );
  }
}
Data.propTypes = {
  studentId: PropTypes.number.isRequired,
  gradeNow: PropTypes.string.isRequired,
  benchmarkAssessmentKey: PropTypes.string.isRequired,
  readerJson: PropTypes.object.isRequired
};
Data.contextTypes = {
  nowFn: PropTypes.func.isRequired
};


const styles = {
  mainBox: {
    marginBottom: 40
  }
};
