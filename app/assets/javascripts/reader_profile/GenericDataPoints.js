import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {gradeText} from '../helpers/gradeText';
import Card from '../components/Card';
import {ScoreBadge} from './containers';
import {thresholdsExplanation} from './HoverSummary';

// Generic placeholder list of data points
export default class GenericDataPoints extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {rows} = this.props;
    const sortedRows = _.sortBy(rows, row => -1 *row.atMoment.unix());
    return (
      <div style={{fontSize: 14, display: 'flex', flexDirection: 'column', marginBottom: 15}}>
        {sortedRows.map(row => {
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
              <div style={{display: 'flex'}}>
                <div style={{marginRight: 10}}><b>{prettyAssessmentText}</b></div>
                <div>{atMoment.from(nowFn())} on {atMoment.format('M/D/YY')}</div>
              </div>
              <ScoreBadge
                concernKey={concernKey}
                score={score}
                innerStyle={{margin: 10}}
              />
              <div>{thresholdsExplanation(thresholds)}</div>
              <div>in {gradeText(gradeThen)}</div>
            </Card>
          );
        })}
      </div>
    );
  }
}
GenericDataPoints.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
GenericDataPoints.propTypes = {
  rows: PropTypes.array.isRequired
};

