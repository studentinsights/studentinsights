import React from 'react';
import PropTypes from 'prop-types';

import DashboardHelpers from '../DashboardHelpers';
import SchoolwideAttendance from './SchoolwideAttendance';
import {apiFetchJson} from '../../../helpers/apiFetchJson';
import measurePageLoad from '../../../helpers/measurePageLoad';

class SchoolwideAbsences extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dashboardStudents: this.props.dashboardStudents,
      isLoading: false
    };
  }

  componentWillMount() {
    //if the parent component already has the dashboard data, we don't need to duplicate it
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
          dashboardStudents = {dashboardStudents}/>);
  }
}

SchoolwideAbsences.propTypes = {
  dashboardStudents: PropTypes.array.isRequired,
  schoolId: PropTypes.number
};

measurePageLoad(info => console.log(JSON.stringify(info, null, 2))); // eslint-disable-line no-console


export default SchoolwideAbsences;
