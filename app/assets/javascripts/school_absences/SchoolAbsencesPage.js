import React from 'react';
import PropTypes from 'prop-types';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import SchoolAbsencesDashboard from './SchoolAbsencesDashboard';
import {
  updateGlobalStylesToTakeFullHeight,
  updateGlobalStylesToRemoveHorizontalScrollbars
} from '../helpers/globalStylingWorkarounds';


// For school or house admin to see students missing school, that the
// school isn't yet providing supports for (eg, SST, reaching out to family.
// etc.).  The intention is to focus attention on individual students and
// taking action, rather than understanding distributions or aggregate
// patterns.
export default class SchoolAbsencesPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  componentDidMount() {
    const {disableStylingForTest} = this.props;
    if (disableStylingForTest) return;
    updateGlobalStylesToTakeFullHeight();
    updateGlobalStylesToRemoveHorizontalScrollbars();
  }

  fetchJson() {
    const {schoolIdOrSlug} = this.props;
    const url = `/api/schools/${schoolIdOrSlug}/absences/data`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <GenericLoader
        style={{flex: 1, display: 'flex'}}
        promiseFn={this.fetchJson}
        render={this.renderJson} />
    );
  }

  renderJson(json) {
    return (
      <SchoolAbsencesDashboard
        studentsWithAbsences={json.students_with_events}
        school={json.school}
      />
    );
  }
}

SchoolAbsencesPage.propTypes = {
  schoolIdOrSlug: PropTypes.string.isRequired,
  disableStylingForTest: PropTypes.bool
};
