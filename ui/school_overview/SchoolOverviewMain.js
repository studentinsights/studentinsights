import React from 'react';
import MixpanelUtils from '../../app/assets/javascripts/helpers/mixpanel_utils.jsx';
import JsonLoader from '../util/JsonLoader';

class SchoolOverviewMain extends React.Component {
  constructor(props) {
    super(props);
    this.onLoaded = this.onLoaded.bind(this);
  }

  onLoaded(json) {
    MixpanelUtils.registerUser(json.current_educator);
    MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_OVERVIEW_DASHBOARD' });
  }

  render() {
    const {schoolSlug} = this.props;
    const path = `/schools/${schoolSlug}/overview`;
    return (
      <JsonLoader path={path} onLoaded={this.onLoaded}>
        {this.renderSchoolOverview}
      </JsonLoader>
    );
  }

  renderSchoolOverview(json) {
    const {SchoolOverviewPage, Filters} = window.shared;
    return (
      <SchoolOverviewPage
        allStudents={json.students}
        school={json.school}
        serviceTypesIndex={json.constant_indexes.service_types_index}
        eventNoteTypesIndex={json.constant_indexes.event_note_types_index}
        initialFilters={Filters.parseFiltersHash(window.location.hash)}
      />
    );
  }
}
SchoolOverviewMain.propTypes = {
  schoolSlug: React.PropTypes.string.isRequired
};

export default SchoolOverviewMain;