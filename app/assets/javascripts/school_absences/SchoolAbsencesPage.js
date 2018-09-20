import React from 'react';
import PropTypes from 'prop-types';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import SchoolAbsenceDashboard from './SchoolAbsenceDashboard';
import {
  updateGlobalStylesToTakeFullHeight,
  updateGlobalStylesToRemoveHorizontalScrollbars
} from '../helpers/globalStylingWorkarounds';


export default class SchoolAbsencesPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  componentDidMount() {
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
      <SchoolAbsenceDashboard
        studentsWithAbsences={json.students_with_events}
        school={json.school}
      />
    );
  }
}

SchoolAbsencesPage.propTypes = {
  schoolIdOrSlug: PropTypes.string.isRequired
};
