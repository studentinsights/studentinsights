import React from 'react';
import _ from 'lodash';

import DashboardHelpers from '../dashboard_helpers.jsx';
import StudentsTable from '../students_table.jsx';
import DashboardBarChart from '../dashboard_bar_chart.jsx';
import DateSlider from '../date_slider.jsx';


export default React.createClass({
  displayName: 'SchoolAbsenceDashboard',

  propTypes: {
    schoolAverageDailyAttendance: React.PropTypes.object.isRequired,
    homeroomAverageDailyAttendance: React.PropTypes.object.isRequired,
    dashboardStudents: React.PropTypes.array.isRequired,
    schoolAbsenceEvents: React.PropTypes.object.isRequired,
    dateRange: React.PropTypes.array.isRequired
  },

  getInitialState: function() {
    return {
      displayDates: this.props.dateRange,
      selectedHomeroom: null
    };
  },

  //Monthly attendance for the school must be calculated after the range filter is applied
  monthlySchoolAttendance: function(schoolAverageDailyAttendance) {
    let monthlySchoolAttendance = {};
    //Use the filtered daterange to find the days to include
    this.state.displayDates.forEach((day) => {
      let date = moment(day).date(1).format("YYYY-MM"); //first day of the month in which 'day' occurs
      (monthlySchoolAttendance[date] === undefined) ? //if there's nothing for this month yet
      monthlySchoolAttendance[date] = [schoolAverageDailyAttendance[day]] :
      monthlySchoolAttendance[date] = monthlySchoolAttendance[date].concat(schoolAverageDailyAttendance[day]);
    });
    return monthlySchoolAttendance;
  },

  filteredHomeRoomAttendance: function(dailyHomeroomAttendance) {
    return _.map(dailyHomeroomAttendance, (homeroom) => {
      return this.state.displayDates.map((date) => {
        return homeroom[date];
      });
    });
  },

  studentAbsenceCounts: function(absencesArray) {
    let studentAbsenceCounts = {};
    this.state.displayDates.forEach((day) => {
      _.each(this.props.schoolAbsenceEvents[day], (absence) => {
        studentAbsenceCounts[absence.student_id] = studentAbsenceCounts[absence.student_id] || 0;
        studentAbsenceCounts[absence.student_id]++;
      });
    });
    return studentAbsenceCounts;
  },

  setDate: function(range) {
    this.setState({
      displayDates: DashboardHelpers.filterDates(this.props.dateRange,
                                                  moment.unix(range[0]).format("YYYY-MM-DD"),
                                                  moment.unix(range[1]).format("YYYY-MM-DD"))
    });
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
            {this.renderDateRangeSlider()}
            {this.renderStudentAbsenceTable()}
          </div>
        </div>
    );
  },

  renderMonthlyAbsenceChart: function() {
    const monthlyAttendance = this.monthlySchoolAttendance(this.props.schoolAverageDailyAttendance);
    const filteredAttendanceSeries = Object.keys(monthlyAttendance).map( (month) => {
      const rawAvg = _.sum(monthlyAttendance[month])/monthlyAttendance[month].length;
      return Math.round(rawAvg*10)/10;
    });
    const categories = Object.keys(monthlyAttendance);

    return (
        <DashboardBarChart
          id = {'string'}
          categories = {{categories: categories}}
          seriesData = {filteredAttendanceSeries}
          yAxisMin = {80}
          yAxisMax = {100}
          titleText = {'Average Attendance By Month'}
          measureText = {'Attendance (Percent)'}
          tooltip = {{
            pointFormat: 'Average Daily Attendance: <b>{point.y}</b>',
            valueSuffix: '%'}}
          onColumnClick = {this.resetStudentList}
          onBackgroundClick = {this.resetStudentList}/>
    );
  },

  renderHomeroomAbsenceChart: function() {
    const homeroomAverageDailyAttendance = this.props.homeroomAverageDailyAttendance;
    const filteredHomeRoomAttendance = this.filteredHomeRoomAttendance(homeroomAverageDailyAttendance);
    const homeroomSeries = filteredHomeRoomAttendance.map((homeroom) => {
      const rawAvg = _.sum(homeroom)/homeroom.length;
      return Math.round(rawAvg*10)/10;
    });
    return (
        <DashboardBarChart
          id = {'string'}
          categories = {{categories: Object.keys(homeroomAverageDailyAttendance)}}
          seriesData = {homeroomSeries}
          yAxisMin = {80}
          yAxisMax = {100}
          titleText = {'Average Attendance By Homeroom'}
          measureText = {'Attendance (Percent)'}
          tooltip = {{
            pointFormat: 'Average Daily Attendance: <b>{point.y}</b>',
            valueSuffix: '%'}}
          onColumnClick = {this.setStudentList}
          onBackgroundClick = {this.resetStudentList}/>
    );
  },

  renderStudentAbsenceTable: function () {
    const studentAbsenceCounts = this.studentAbsenceCounts();
    const studentsByHomeroom = DashboardHelpers.groupByHomeroom(this.props.dashboardStudents);
    const students = studentsByHomeroom[this.state.selectedHomeroom] || this.props.dashboardStudents;
    let rows =[];
    students.forEach((student) => {
      rows.push({
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        events: studentAbsenceCounts[student.id] || 0
      });
    });

    return (
      <StudentsTable
        rows = {rows}
        selectedHomeroom = {this.state.selectedHomeroom}/>
    );
  },

  renderDateRangeSlider: function() {
    const firstDate = this.props.dateRange[0];
    const lastDate = this.props.dateRange[this.props.dateRange.length - 1];
    return (
      <DateSlider
        rangeStart = {parseInt(moment(firstDate).format("X"))}
        rangeEnd = {parseInt(moment(lastDate).format("X"))}
        setDate={this.setDate}/>
    );
  }
});
