import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {gradeText} from '../helpers/gradeText';
import Card from '../components/Card';
import {statsForDataPoint} from './ChipForDibels';
import {ScoreBadge} from './containers';
import {thresholdsExplanation} from './HoverSummary';


export default class DibelsDialog extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {gradeNow, benchmarkDataPoints} = this.props;
    const rows = _.sortBy(benchmarkDataPoints.map(dataPoint => {
      return statsForDataPoint(dataPoint, gradeNow, nowFn());
    }), row => row.atMoment.unix());

    return (
      <div style={{fontSize: 14, display: 'flex', flexDirection: 'column', marginBottom: 15}}>
          {rows.map(row => {
            const {
              id,
              prettyAssessmentText,
              score,
              atMoment,
              gradeThen,
              thresholds,
              concernKey
            } = row;
            return (
              <Card key={id} style={{marginBottom: 20}}>
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
              </Card>
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
  benchmarkDataPoints: PropTypes.array.isRequired
};
