import React from 'react';
import GenericLoader from '../components/GenericLoader';
import ExperimentalBanner from '../components/ExperimentalBanner';
import {apiFetchJson} from '../helpers/apiFetchJson';
import Breakdown from '../equity/Breakdown';

export default class SchoolEquityPrincipalPage extends React.Component {

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
      <div className="SchoolEquityPrincipalPage">
        <ExperimentalBanner />
        <GenericLoader
          promiseFn={this.fetchSchoolOverviewData}
          render={this.renderBreakdown} />
      </div>
    );
  }

  renderBreakdown(json) {
    return <Breakdown students={json.students} school={json.school} />;
  }

}

SchoolEquityPrincipalPage.propTypes = {
  schoolId: React.PropTypes.string.isRequired
};
