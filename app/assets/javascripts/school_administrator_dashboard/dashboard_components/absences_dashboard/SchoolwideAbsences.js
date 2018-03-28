import React from 'react';
import PropTypes from 'prop-types';

import DashboardHelpers from '../DashboardHelpers';
import SchoolwideAttendance from './SchoolwideAttendance';
import {apiFetchJson} from '../../../helpers/apiFetchJson';

class SchoolwideAbsences extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dashboardStudents: this.props.dashboardStudents,
      isLoading: false
    };
  }

  componentWillMount() {
    if(this.props.dashboardStudents.length) return;
    const url = `/schools/${this.props.schoolId}/absence_dashboard_data`;
    this.setState({isLoading: true});

    apiFetchJson(url)
      .then(response => { this.setState({dashboardStudents: response, isLoading: false}); });
  }

  render() {
    const {dashboardStudents, isLoading} = this.state;

    if (isLoading) {
      return <p>Loading ...</p>;
    }

    return (
        <SchoolwideAttendance
          schoolAbsenceEvents = {DashboardHelpers.absenceEventsByDay(dashboardStudents)}
          dashboardStudents = {this.state.dashboardStudents}/>);
  }
}

SchoolwideAbsences.propTypes = {
  dashboardStudents: PropTypes.array.isRequired,
  schoolId: PropTypes.number
};

export default SchoolwideAbsences;
