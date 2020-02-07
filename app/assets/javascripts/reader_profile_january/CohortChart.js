import React from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import {toSchoolYear} from '../helpers/schoolYear';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {percentileWithSuffix} from '../helpers/percentiles';
import GenericLoader from '../components/GenericLoader';
import BoxChart from './BoxChart';


export default class CohortChart extends React.Component {
  constructor(props) {
    super(props);

    this.fetchJson = this.fetchJson.bind(this);
    this.renderBoxChartFromJson = this.renderBoxChartFromJson.bind(this);
  }

  fetchJson() {
    const {nowFn} = this.context;
    const {studentId, benchmarkAssessmentKey} = this.props;
    const schoolYearNow = toSchoolYear(nowFn());
    const queryString = qs.stringify({
      benchmark_assessment_key: benchmarkAssessmentKey,
      school_years: [schoolYearNow - 1, schoolYearNow]
    }, {arrayFormat: 'bracket'});
    const url = `/api/students/${studentId}/reader_profile_cohort_json?${queryString}`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="CohortChart">
        <GenericLoader
          promiseFn={this.fetchJson}
          render={this.renderBoxChartFromJson}
        />
      </div>
    );
  }

  renderBoxChartFromJson(json) {
    const {gradeNow, readerJson, benchmarkAssessmentKey} = this.props;
    console.log('json.cells', json.cells);
    return (
      <BoxChart
        gradeNow={gradeNow}
        readerJson={readerJson}
        benchmarkAssessmentKey={benchmarkAssessmentKey}
        renderRaw={true}
        renderCellFn={({schoolYear, benchmarkPeriodKey, styled}) => {
          const whenKey = [schoolYear, benchmarkPeriodKey].join('-');
          const cell = json.cells[whenKey];
          const pText = cell ? percentileWithSuffix(cell.stats.p) : null;
          return (
            <div key={benchmarkPeriodKey} title={pText} style={styled}>
              {pText}
            </div>
          );
        }}
      />
    );
  }
}
CohortChart.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
CohortChart.propTypes = {
  studentId: PropTypes.number.isRequired,
  gradeNow: PropTypes.string.isRequired,
  benchmarkAssessmentKey: PropTypes.string.isRequired,
  readerJson: PropTypes.object.isRequired
};
