import React from 'react';
import PropTypes from 'prop-types';
import {gradeText} from '../helpers/gradeText';
import {prettyDibelsText} from '../reading/readingData';
import {statsForDataPoint} from './ChipForDibels';
import {Concern} from './containers';
import {thresholdsExplanation} from './HoverSummary';


export default class DibelsDialog extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {gradeNow, benchmarkAssessmentKey, benchmarkDataPoints} = this.props;
    const labelText = prettyDibelsText(benchmarkAssessmentKey);

    return (
      <div style={{display: 'flex', flexDirection: 'column', marginBottom: 15}}>
        <div style={{fontSize: 12, marginBottom: 2, textAlign: 'left'}}>{labelText}</div>
          {benchmarkDataPoints.map(dataPoint => {
            const {
              prettyAssessmentText,
              score,
              atMoment,
              gradeThen,
              thresholds,
              concernKey
            } = statsForDataPoint(dataPoint, gradeNow, nowFn());
            return (
              <div key={dataPoint.id}>
                <div>{prettyAssessmentText}</div>
                <div><DibelsBadge concernKey={concernKey} score={score} /></div>
                <div>{thresholdsExplanation(thresholds)}</div>
                <div>{atMoment.format('M/D/YY')} in {gradeText(gradeThen)}</div>
              </div>
            );
          })}
      </div>
    );
  }
}
DibelsDialog.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
DibelsDialog.propTypes = {
  gradeNow: PropTypes.string.isRequired,
  benchmarkAssessmentKey: PropTypes.string.isRequired,
  benchmarkDataPoints: PropTypes.array.isRequired
};


function DibelsBadge(props) {
  const {score, concernKey} = props;
  return (
    <Concern concernKey={concernKey}>
      <div style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 18,
        color: 'white'
      }}>{score}</div>
    </Concern>
  );
}
DibelsBadge.propTypes = {
  score: PropTypes.string.isRequired,
  concernKey: PropTypes.string.isRequired
};
