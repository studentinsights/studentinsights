import React from 'react';
import GenericLoader from '../components/GenericLoader';
import ExperimentalBanner from '../components/ExperimentalBanner';
import {apiFetchJson} from '../helpers/apiFetchJson';
import ExploreClassroomComparisons from './ExploreClassroomComparisons';

// This is an internal-only page for exploring equity in classroom assignments for
// the current classroom.  It's separate from the classroom balancing feature, but
// shows similar data.
export default class ExploreSchoolEquityPage extends React.Component {
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
      <div className="ExploreSchoolEquityPage">
        <ExperimentalBanner />
        <GenericLoader
          promiseFn={this.fetchSchoolOverviewData}
          render={this.renderBreakdown} />
      </div>
    );
  }

  renderBreakdown(json) {
    return <ExploreClassroomComparisons students={json.students} school={json.school} />;
  }

}

ExploreSchoolEquityPage.propTypes = {
  schoolId: React.PropTypes.string.isRequired
};
