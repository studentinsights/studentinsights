import React from 'react';
import PropTypes from 'prop-types';
import {apiFetchJson} from '../helpers/apiFetchJson';
import GenericLoader from '../components/GenericLoader';
import PageContainer from './PageContainer';


// React entrypoint for student profile v3 page
export default class StudentProfilePageRoute extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  fetchJson() {
    const {studentId} = this.props;
    const url = `/api/students/${studentId}/profile_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="StudentProfilePageRoute" style={styles.flexVertical}>
        <GenericLoader
          promiseFn={this.fetchJson}
          style={styles.flexVertical}
          render={this.renderJson} />
      </div>
    );
  }

  renderJson(json) {
    const {queryParams, history} = this.props;
    return (
      <PageContainer
        queryParams={queryParams}
        history={history} 
        defaultFeed={json.feed}
        profileJson={{
          currentEducator: json.current_educator,
          student: json.student,
          chartData: json.chart_data,
          dibels: json.dibels,
          serviceTypesIndex: json.service_types_index,
          educatorsIndex: json.educators_index,
          access: json.access,
          transitionNotes: json.transition_notes,
          profileInsights: json.profile_insights,
          teams: json.teams,
          iepDocument: json.latest_iep_document,
          sections: json.sections,
          currentEducatorAllowedSections: json.current_educator_allowed_sections,
          attendanceData: json.attendance_data
        }}
      />
    );
  }
}
StudentProfilePageRoute.propTypes = {
  studentId: PropTypes.number.isRequired,
  queryParams: PropTypes.object.isRequired,
  history: PropTypes.shape({
    pushState: PropTypes.func.isRequired,
    replaceState: PropTypes.func.isRequired.isRequired
  }).isRequired
};

const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  }
};