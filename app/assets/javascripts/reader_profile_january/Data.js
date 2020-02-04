import React from 'react';
import PropTypes from 'prop-types';
import BoxChart from './BoxChart';
import RawDibelsScores from './RawDibelsScores';
import Expandable from './Expandable';


export default class Data extends React.Component {
  render() {
    return (
      <div className="Data">
        {this.renderBoxChart()}
        <div style={styles.expansions}>
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
