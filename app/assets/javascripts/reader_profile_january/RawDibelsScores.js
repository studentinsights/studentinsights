import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {adjustedGrade} from '../helpers/gradeText';
import {benchmarkPeriodToMoment} from '../reading/readingData';
import GenericDibelsDataPoint from './GenericDibelsDataPoint';


// deprecated
export default class RawDibelsScores extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: false
    };

    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    e.preventDefault();
    this.setState({isExpanded: true});
  }

  render() {
    const {nowFn} = this.context;
    const {gradeNow, readerJson, benchmarkAssessmentKey} = this.props;
    const dataPoints = readerJson.benchmark_data_points.filter(d => d.benchmark_assessment_key === benchmarkAssessmentKey);
    const sortedDataPoints = _.sortBy(dataPoints, dataPoint => {
      return -1 * benchmarkPeriodToMoment(dataPoint.benchmark_period_key, dataPoint.benchmark_school_year).unix();
    });
    return (
      <div className="RawDibelsScores">
        {sortedDataPoints.map(dataPoint => {
          const gradeThen = adjustedGrade(dataPoint.benchmark_school_year, gradeNow, nowFn());
          return (
            <GenericDibelsDataPoint
              key={dataPoint.id}
              dataPoint={dataPoint}
              gradeThen={gradeThen}
            />
          );
        })}
      </div>

    );
  }
}
RawDibelsScores.propTypes = {
  readerJson: PropTypes.object.isRequired,
  benchmarkAssessmentKey: PropTypes.string.isRequired,
  gradeNow: PropTypes.string.isRequired
};
RawDibelsScores.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
