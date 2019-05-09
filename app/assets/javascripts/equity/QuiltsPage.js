import PropTypes from 'prop-types';
import React from 'react';
import {apiFetchJson} from '../helpers/apiFetchJson';
import GenericLoader from '../components/GenericLoader';
import ExperimentalBanner from '../components/ExperimentalBanner';
import Quilts from './Quilts';

// This is an internal-only page for exploring equity in schools.
export default class QuiltsPage extends React.Component {
  constructor(props) {
    super(props);

    this.fetchSchoolOverviewData = this.fetchSchoolOverviewData.bind(this);
    this.renderBreakdown = this.renderBreakdown.bind(this);
  }

  fetchSchoolOverviewData() {
    const {schoolId} = this.props;
    const url = `/schools/${schoolId}/overview_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="QuiltsPage">
        <ExperimentalBanner />
        <GenericLoader
          promiseFn={this.fetchSchoolOverviewData}
          render={this.renderBreakdown} />
      </div>
    );
  }

  renderBreakdown(json) {
    return <Quilts students={json.students} school={json.school} />;
  }
}

QuiltsPage.propTypes = {
  schoolId: PropTypes.string.isRequired
};
