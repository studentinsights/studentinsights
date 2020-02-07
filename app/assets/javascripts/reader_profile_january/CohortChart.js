import React from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import BoxChart from './BoxChart';


export default class CohortChart extends React.Component {
  render() {
    const {gradeNow, readerJson, benchmarkAssessmentKey} = this.props;
    const url = `/reading/cohort?${qs.stringify({grade: gradeNow})}`;
    return (
      <div className="CohortChart">
        <GenericLoader
          promiseFn={() => apiFetchJson(url)}
          render={json => (
            <BoxChart
              gradeNow={gradeNow}
              readerJson={readerJson}
              benchmarkAssessmentKey={benchmarkAssessmentKey}
              renderCellFn={({dataPoint}) => {
                const value = dataPoint ? dataPoint.json.value : null;
                return value;
              }}
            />
          )}
        />
      </div>
    );
  }
}
CohortChart.propTypes = {
  gradeNow: PropTypes.string.isRequired,
  benchmarkAssessmentKey: PropTypes.string.isRequired,
  readerJson: PropTypes.object.isRequired
};
