import React from 'react';
import PropTypes from 'prop-types';
import {gradeText} from '../helpers/gradeText';
import BoxChart from './BoxChart';
import Expandable from './Expandable';
import CohortChart from './CohortChart';


export default class Data extends React.Component {
  render() {
    return (
      <div className="Data">
        {this.renderBoxChart()}
        <div style={styles.expansions}>
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
    const {gradeNow, readerJson, benchmarkAssessmentKey} = this.props;
    return (
      <Expandable text={`Context for ${gradeText(gradeNow)} cohort`}>
        <CohortChart
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
      <Expandable text="Show raw scores">
        <BoxChart
          gradeNow={gradeNow}
          readerJson={readerJson}
          benchmarkAssessmentKey={benchmarkAssessmentKey}
          renderCellFn={({valueEl}) => valueEl}
        />
      </Expandable>
    );
  }
}
Data.propTypes = {
  gradeNow: PropTypes.string.isRequired,
  benchmarkAssessmentKey: PropTypes.string.isRequired,
  readerJson: PropTypes.object.isRequired
};
Data.contextTypes = {
  nowFn: PropTypes.func.isRequired
};


const styles = {
  expansions: {
    marginTop: 40
  }
};
