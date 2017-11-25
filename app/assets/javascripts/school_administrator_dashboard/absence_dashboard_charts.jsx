import React from 'react';

import DashboardHelpers from './dashboard_helpers.jsx';
import StudentsTable from './students_table.jsx';
import DashboardBarChart from './dashboard_bar_chart.jsx';


export default React.createClass({
  displayName: 'AbsenceDashboardCharts',

  propTypes: {
    filteredSchoolAttendanceSeries: React.PropTypes.array.isRequired,
    schoolAttendanceMonths: React.PropTypes.array.isRequired,
    filteredHomeRoomAttendanceSeries: React.PropTypes.array.isRequired,
    homerooms: React.PropTypes.array.isRequired,
    dashboardStudents: React.PropTypes.array.isRequired,
    dateRange: React.PropTypes.array.isRequired
  },

  getInitialState: function() {
    return {
      selectedHomeroom: null
    };
  },

  studentsForTable: function() {
    let rows =[];
    const studentsByHomeroom = DashboardHelpers.groupByHomeroom(this.props.dashboardStudents);
    const students = studentsByHomeroom[this.state.selectedHomeroom] || this.props.dashboardStudents;
    students.forEach((student) => {
      rows.push({
        first_name: student.first_name,
        last_name: student.last_name,
        absences: this.studentAbsenceCount(student.absences)
      });
    });
    return rows;
  },

  studentAbsenceCount: function(absences) {
    return absences.filter((event) => {
      const start_date = this.props.dateRange[0];
      const end_date = this.props.dateRange[this.props.dateRange.length-1];
      return moment.utc(event.occurred_at).isBetween(start_date, end_date, null, '[]');
    }).length;
  },

  setStudentList: function(highchartsEvent) {
    this.setState({selectedHomeroom: highchartsEvent.point.category});
  },

  resetStudentList: function() {
    this.setState({selectedHomeroom: null});
  },

  render: function() {
    return (
        <div>
          <div className="DashboardChartsColumn">
            {this.renderMonthlyAbsenceChart()}
            {this.renderHomeroomAbsenceChart()}
          </div>
          <div className="DashboardRosterColumn">
            {this.renderStudentAbsenceTable()}
          </div>
        </div>
    );
  },

  renderMonthlyAbsenceChart: function() {
    return (
        <DashboardBarChart
          id = {'string'}
          categories = {this.props.schoolAttendanceMonths}
          seriesData = {this.props.filteredSchoolAttendanceSeries}
          titleText = {'Average Attendance By Month'}
          measureText = {'Attendance (Percent)'}
          onColumnClick = {this.resetStudentList}
          onBackgroundClick = {this.resetStudentList}/>
    );
  },

  renderHomeroomAbsenceChart: function() {
    return (
        <DashboardBarChart
          id = {'string'}
          categories = {this.props.homerooms}
          seriesData = {this.props.filteredHomeRoomAttendanceSeries}
          titleText = {'Average Attendance By Homeroom'}
          measureText = {'Attendance (Percent)'}
          onColumnClick = {this.setStudentList}
          onBackgroundClick = {this.resetStudentList}/>
    );
  },

  renderStudentAbsenceTable: function () {
    return (
      <StudentsTable
        rows = {this.studentsForTable()}
        selectedHomeroom = {this.state.selectedHomeroom}/>
    );
  }
});
