import React from 'react';
import PropTypes from 'prop-types';
import {gradeText} from '../helpers/gradeText';
import BoxChart from './BoxChart';
import Expandable from './Expandable';
import CohortChart from './CohortChart';
import {BLANK, PRESENT} from './colors';


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
      <BoxChart
        gradeNow={gradeNow}
        readerJson={readerJson}
        benchmarkAssessmentKey={benchmarkAssessmentKey}
        renderCellFn={({benchmarkPeriodKey}) => benchmarkPeriodKey}
      />
    );
  }

  renderCohort() {
    const {studentId, gradeNow, readerJson, benchmarkAssessmentKey} = this.props;
    return (
      <Expandable text={`Percentile in ${gradeText(gradeNow)} school cohort`}>
        <CohortChart
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
        <BoxChart
          gradeNow={gradeNow}
          readerJson={readerJson}
          benchmarkAssessmentKey={benchmarkAssessmentKey}
          renderCellFn={({value, benchmarkPeriodKey, boxStyle}) => {
            const cellStyle = {
              ...boxStyle,
              outline: `1px solid ${PRESENT}`,
              backgroundColor: BLANK,
              zIndex: value ? 1 : 0 // for outline overlapping
            };
            return (
              <div key={benchmarkPeriodKey} style={cellStyle}>
                {value}
              </div>
            );
          }}
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
