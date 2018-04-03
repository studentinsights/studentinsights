import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import DashboardHelpers from '../DashboardHelpers';
import StudentsTable from '../StudentsTable';
import DashboardBarChart from '../DashboardBarChart';
import {latestNoteDateText} from '../../../helpers/latestNoteDateText';


class SchoolTardiesDashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {selectedHomeroom: null};
    this.setStudentList = (highchartsEvent) => {
      this.setState({selectedHomeroom: highchartsEvent.point.category});
    };
    this.resetStudentList = () => {
      this.setState({selectedHomeroom: null});
    };
  }

  createMonthCategories(eventsByDay) {
    let monthCategories = {};
    let lastStoredMonth;
    const startMonth = moment.utc().subtract(3, 'months');

    Object.keys(eventsByDay).sort().forEach((day, dayIndex) => {
      const month = moment.utc(day);
      if (lastStoredMonth != month.date(1).format("MMM 'YY") && month.isSameOrAfter(startMonth, 'month')) {
        lastStoredMonth = month.date(1).format("MMM 'YY");
        monthCategories[dayIndex] = lastStoredMonth;
      }
    });
    return monthCategories;
  }

  getDatesForPastThreeMonths() {
    const today = moment.utc().format('YYYY-MM-DD');
    let datesForPastThreeMonths = [];
    let date = moment.utc().subtract(3, 'months').format('YYYY-MM-DD');
    while (moment.utc(date).isBefore(moment.utc(today))) {
      datesForPastThreeMonths.push(date);
      date = moment.utc(date).add(1, 'day').format('YYYY-MM-DD');
    }
    return datesForPastThreeMonths;
  }

  studentTardyCounts(tardiesArray) {
    let studentTardyCounts = {};
    const daysWithTardies = Object.keys(this.props.schoolTardyEvents);
    const startDate = DashboardHelpers.schoolYearStart();
    const endDate = moment.utc().format("YYYY-MM-DD");
    const schoolYearTardies = DashboardHelpers.filterDates(daysWithTardies.sort(), startDate, endDate);

    schoolYearTardies.forEach((day) => {
      _.each(this.props.schoolTardyEvents[day], (tardy) => {
        studentTardyCounts[tardy.student_id] = studentTardyCounts[tardy.student_id] || 0;
        studentTardyCounts[tardy.student_id]++;
      });
    });
    return studentTardyCounts;
  }

  render() {
    return (
        <div className="DashboardContainer">
          <div className="DashboardChartsColumn">
            {this.renderMonthlyTardiesChart()}
            {this.renderHomeroomTardiesChart()}
          </div>
          <div className="DashboardRosterColumn">
            {this.renderStudentTardiesTable()}
          </div>
        </div>
    );
  }

  renderMonthlyTardiesChart() {
    const seriesData = this.getDatesForPastThreeMonths().map((date) => {
      if (this.props.schoolTardyEvents[date] === undefined) this.props.schoolTardyEvents[date] = [];
      return [moment.utc(date).format('ddd MM/DD'), this.props.schoolTardyEvents[date].length];
    });
    const monthCategories = this.createMonthCategories(this.props.schoolTardyEvents);
    let tickPositions = Object.keys(monthCategories).map(Number);
    tickPositions.splice(0, 1);

    return (
        <DashboardBarChart
          id = {'string'}
          categories = {{
            offset: 0,
            linkedTo: 0,
            categories: monthCategories,
            tickPositions: tickPositions,
            tickmarkPlacement: "on"
          }}
          seriesData = {seriesData}
          titleText = {'Schoolwide Tardies (Last three months)'}
          measureText = {'Number of Tardies'}
          tooltip = {{
            pointFormat: 'Total tardies: <b>{point.y}</b>'}}
          onColumnClick = {this.resetStudentList}
          onBackgroundClick = {this.resetStudentList}/>
    );
  }

  renderHomeroomTardiesChart() {
    const homerooms = Object.keys(this.props.homeroomTardyEvents);
    const homeroomSeries = homerooms.map((homeroom) => {
      return this.props.homeroomTardyEvents[homeroom];
    });

    return (
        <DashboardBarChart
          id = {'string'}
          categories = {{categories: homerooms}}
          seriesData = {homeroomSeries}
          titleText = {'Tardies By Homeroom (School Year)'}
          measureText = {'Number of Tardies'}
          tooltip = {{
            pointFormat: 'Total tardies: <b>{point.y}</b>'}}
          onColumnClick = {this.setStudentList}
          onBackgroundClick = {this.resetStudentList}/>
    );
  }

  renderStudentTardiesTable() {
    const studentTardyCounts = this.studentTardyCounts();
    const studentsByHomeroom = DashboardHelpers.groupByHomeroom(this.props.dashboardStudents);
    const students = studentsByHomeroom[this.state.selectedHomeroom] || this.props.dashboardStudents;
    let rows =[];
    students.forEach((student) => {
      rows.push({
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        last_sst_date_text: latestNoteDateText(300, student.event_notes),
        events: studentTardyCounts[student.id] || 0
      });
    });

    return (
      <StudentsTable
        rows = {rows}
        selectedHomeroom = {this.state.selectedHomeroom}
        schoolYearFlag ={true}/>
    );
  }
}

SchoolTardiesDashboard.propTypes = {
  schoolTardyEvents: PropTypes.object.isRequired,
  homeroomTardyEvents: PropTypes.object.isRequired,
  dashboardStudents: PropTypes.array.isRequired
};

export default SchoolTardiesDashboard;
