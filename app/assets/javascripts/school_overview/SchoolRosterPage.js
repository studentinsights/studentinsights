import PropTypes from 'prop-types';
import React from 'react';
import {apiFetchJson} from '../helpers/apiFetchJson';
import GenericLoader from '../components/GenericLoader';
import SchoolRoster from './SchoolRoster';
import {parseFiltersHash} from '../helpers/Filters';

/*
Homeroom page, for K8 classroom teachers.  Most meaningful the first week or two of school.
*/
export default class SchoolRosterPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderSchoolRoster = this.renderSchoolRoster.bind(this);
  }

  fetchJson() {
    const {schoolIdOrSlug} = this.props;
    const url = `/schools/${schoolIdOrSlug}/overview_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="SchoolRosterPage" style={styles.flexVertical}>
        <GenericLoader
          promiseFn={this.fetchJson}
          style={styles.flexVertical}
          render={this.renderSchoolRoster} />
      </div>
    );
  }

  renderSchoolRoster(json) {
    const {students, school} = json; 
    const serviceTypesIndex = json.constant_indexes.service_types_index;
    const eventNoteTypesIndex = json.constant_indexes.event_note_types_index;
    const initialFilters = parseFiltersHash(window.location.hash);
    return (
      <div style={styles.flexVertical}>
        <SchoolRoster
          allStudents={students}
          school={school}
          serviceTypesIndex={serviceTypesIndex}
          eventNoteTypesIndex={eventNoteTypesIndex}
          initialFilters={initialFilters}
        />
      </div>
    );
  }
}
SchoolRosterPage.propTypes = {
  schoolIdOrSlug: PropTypes.string.isRequired
};

const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  }
};