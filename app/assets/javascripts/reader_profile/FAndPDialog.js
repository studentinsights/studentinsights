import React from 'react';
import PropTypes from 'prop-types';
import {gradeText} from '../helpers/gradeText';
import {statsForDataPoint} from './ChipForFAndPEnglish';
import {ScoreBadge} from './containers';
import {thresholdsExplanation} from './HoverSummary';


export default class FAndPDialog extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {gradeNow, benchmarkDataPoints} = this.props;

    return (
      <div style={{display: 'flex', flexDirection: 'column', marginBottom: 15}}>
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
            <div key={dataPoint.id} style={{marginBottom: 20}}>
              <div>{prettyAssessmentText}</div>
              <div>
                <ScoreBadge
                  concernKey={concernKey}
                  score={score}
                  innerStyle={{padding: 10}}
                />
              </div>
              <div>{thresholdsExplanation(thresholds)}</div>
              <div>{atMoment.format('M/D/YY')} in {gradeText(gradeThen)}</div>
            </div>
          );
        })}
      </div>
    );
  }
}
FAndPDialog.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
FAndPDialog.propTypes = {
  gradeNow: PropTypes.string.isRequired,
  benchmarkDataPoints: PropTypes.array.isRequired
};

