import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {apiFetchJson} from '../helpers/apiFetchJson';
import SectionHeading from '../components/SectionHeading';
import GenericLoader from '../components/GenericLoader';
import ReaderProfileJune from './ReaderProfileJune';


export default class ReaderProfileJunePage extends React.Component {
  render() {
    const {student} = this.props;
    const url = `/api/students/${student.id}/reader_profile_json`;

    return (
      <div className="ReaderProfileJunePage">
        <SectionHeading>Reader Profile (June v2)</SectionHeading>
        <GenericLoader
          promiseFn={() => apiFetchJson(url)}
          render={json => this.renderJson(json)} />
      </div>
    );
  }

  renderJson(json) {
    const {student, access} = this.props;
    return (
      <ReaderProfileJune
        student={student}
        access={access}
        feedCards={json.feed_cards}
        currentSchoolYear={json.current_school_year}
        dataPointsByAssessmentKey={_.groupBy(json.benchmark_data_points, 'benchmark_assessment_key')}
      />
    );
  }
}
ReaderProfileJunePage.propTypes = {
  access: PropTypes.object,
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    grade: PropTypes.any.isRequired
  }).isRequired
};
