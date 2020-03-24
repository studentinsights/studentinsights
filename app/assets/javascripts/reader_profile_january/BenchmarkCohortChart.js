import React from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import {toSchoolYear} from '../helpers/schoolYear';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {percentileWithSuffix} from '../helpers/percentiles';
import GenericLoader from '../components/GenericLoader';
import {BLANK, PRESENT} from './colors';
import BenchmarkBoxChart from './BenchmarkBoxChart';


export default class BenchmarkCohortChart extends React.Component {
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
    return (
      <DibelsBoxChart
        gradeNow={gradeNow}
        readerJson={readerJson}
        benchmarkAssessmentKey={benchmarkAssessmentKey}
        renderRaw={true}
        renderCellFn={({schoolYear, benchmarkPeriodKey, boxStyle}) => {
          const whenKey = [schoolYear, benchmarkPeriodKey].join('-');
          const cell = json.cells[whenKey];
          const pText = cell && cell.stats.p ? percentileWithSuffix(cell.stats.p) : null;
          const tooltipText = (cell && cell.stats.p) ? [
            'Within the school, at that grade level:',
            `  ${padFormatStudentsHave(cell.stats.n_higher, 3)} a higher score`,
            `  ${padFormatStudentsHave(cell.stats.n_equal, 3)} the same score`,
            `  ${padFormatStudentsHave(cell.stats.n_lower, 3)} a lower score`,
            '',
            `A score of "${cell.value}" is in the ${pText} percentile`
          ].join("\n") : null;
          const cellStyle = {
            ...boxStyle,
            outline: `1px solid ${PRESENT}`,
            backgroundColor: BLANK,
            zIndex: pText ? 1 : 0 // for outline overlapping
          };
          return (
            <div key={benchmarkPeriodKey} title={tooltipText} style={cellStyle}>
              {pText}
            </div>
          );
        }}
      />
    );
  }
}
BenchmarkCohortChart.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
BenchmarkCohortChart.propTypes = {
  studentId: PropTypes.number.isRequired,
  gradeNow: PropTypes.string.isRequired,
  benchmarkAssessmentKey: PropTypes.string.isRequired,
  readerJson: PropTypes.object.isRequired
};


function padFormatStudentsHave(num, n) {
  let str = num.toString() + "\t";
  return (num === 1) ? `${str} student has` : `${str} students have`;
}