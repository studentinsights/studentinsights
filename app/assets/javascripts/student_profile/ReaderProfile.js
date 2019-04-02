import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {high, medium, low} from '../helpers/colors';
import GenericLoader from '../components/GenericLoader';
import {prettyDibelsText} from '../reading/readingData';


export default class ReaderProfile extends React.Component {
  render() {
    const {student} = this.props;
    const {id} = student;
    return (
      <div className="ReaderProfile">
        <GenericLoader
          promiseFn={() => apiFetchJson(`/api/students/${id}/reader_profile_json`)}
          render={json => this.renderJson(json)} />
      </div>
    );
  }

  renderJson(json) {
    const benchmarkDataPoints = json.benchmark_data_points;
    const grade = json.grade;
    const currentSchoolYear = json.current_school_year;
    const dataPointsByAssessmentKey = _.groupBy(benchmarkDataPoints, 'benchmark_assessment_key');
    return (
      <div>
        {_.entries(dataPointsByAssessmentKey).map(([benchmarkAssessmentKey, dataPoints]) => {
          return (
            <div key={benchmarkAssessmentKey}>
              <h3>{prettyDibelsText(benchmarkAssessmentKey)}</h3>
              <div>{dataPoints.map(dataPoint => {
                const dataPointMoment = toMoment(currentSchoolYear, dataPoint.benchmark_period_key);
                return (
                  <div key={dataPointMoment.format('YYYYMMDD')}>{dataPointMoment.format('M/D/YY')}</div>
                );
              })}</div>
            </div>
          );
        })}
      </div>
    );
  }
}

ReaderProfile.propTypes = {
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    grade: PropTypes.any.isRequired
  }).isRequired
};


function toMoment(currentSchoolYear, benchmarkPeriodKey) {
  const monthText = {
    fall: '0901',
    winter: '0101',
    spring: '0501'
  }[benchmarkPeriodKey];
  const yearOffset = {
    fall: 0,
    winter: 1,
    spring: 1
  }[benchmarkPeriodKey];
  const year = currentSchoolYear + yearOffset;
  return moment.utc(`${year}${monthText}`, 'YYYYMMDD', true);
}