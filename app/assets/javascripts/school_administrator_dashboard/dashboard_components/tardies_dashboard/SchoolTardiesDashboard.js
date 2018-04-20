import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import DashboardHelpers from '../DashboardHelpers';
import StudentsTable from '../StudentsTable';
import DashboardBarChart from '../DashboardBarChart';
import {latestNoteDateText} from '../../../helpers/latestNoteDateText';
import DashRangeButtons from '../DashRangeButtons';


class SchoolTardiesDashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      startDate: DashboardHelpers.schoolYearStart(),
      selectedHomeroom: null};
    this.setStudentList = (highchartsEvent) => {
      this.setState({selectedHomeroom: highchartsEvent.point.category});
    };
    this.resetStudentList = () => {
      this.setState({selectedHomeroom: null});
    };
  }

  createMonthCategories(seriesData) {
    let monthCategories = {};
    let lastStoredMonth;

    seriesData.forEach((day, dayIndex) => {
      const month = moment(day[0], "ddd MM/DD/YYYY");

      if (lastStoredMonth != month.date(1).format("MMM 'YY")) {
        lastStoredMonth = month.date(1).format("MMM 'YY");
        monthCategories[dayIndex] = lastStoredMonth;
      }
    });
    return monthCategories;
  }

  getDatesSince(date) {
    const today = moment.utc().format('YYYY-MM-DD');
    let result = [];
    while (moment.utc(date).isBefore(moment.utc(today))) {
      result.push(date);
      date = moment.utc(date).add(1, 'day').format('YYYY-MM-DD');
    }
    return result;
  }

  studentTardyCounts(tardiesArray) {
    let studentTardyCounts = {};
    const daysWithTardies = Object.keys(this.props.schoolTardyEvents);
    const today = moment.utc().format("YYYY-MM-DD");
    const schoolYearTardies = DashboardHelpers.filterDates(daysWithTardies.sort(), this.state.startDate, today);

    schoolYearTardies.forEach((day) => {
      _.each(this.props.schoolTardyEvents[day], (tardy) => {
        studentTardyCounts[tardy.student_id] = studentTardyCounts[tardy.student_id] || 0;
        studentTardyCounts[tardy.student_id]++;
      });
    });
    return studentTardyCounts;
  }

  homeroomTardyEventsSince() {
    let homeroomTardyEvents = {};
    const studentRecords = this.props.dashboardStudents;
    const studentsByHomeroom = DashboardHelpers.groupByHomeroom(studentRecords);
    const startDate = this.state.startDate;
    Object.keys(studentsByHomeroom).forEach((homeroom) => {
      homeroomTardyEvents[homeroom] = 0;
      _.each(studentsByHomeroom[homeroom], (student) => {
        student.tardies.forEach((tardy) => {
          if (moment.utc(tardy.occurred_at).isSameOrAfter(startDate)) {
            homeroomTardyEvents[homeroom]++;
          }
        });
      });
    });
    return homeroomTardyEvents;
  }

  render() {
    return (
        <div className="DashboardContainer">
          <div className="DashboardRosterColumn">
            {this.renderRangeSelector()}
            {this.renderStudentTardiesTable()}
          </div>
          <div className="DashboardChartsColumn">
            {this.renderMonthlyTardiesChart()}
            {this.renderHomeroomTardiesChart()}
          </div>
        </div>
    );
  }

  renderMonthlyTardiesChart() {
    const seriesData = this.getDatesSince(this.state.startDate).map((date) => {
      const day = moment.utc(date).format("ddd MM/DD/YYYY");
      const tardies = this.props.schoolTardyEvents[date] ? this.props.schoolTardyEvents[date].length : 0;
      return [day, tardies];
    });
    const monthCategories = this.createMonthCategories(seriesData);
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
    const homeroomTardyEvents = this.homeroomTardyEventsSince(this.state.startDate);
    const homerooms = Object.keys(homeroomTardyEvents);
    const homeroomSeries = homerooms.map((homeroom) => {
      return homeroomTardyEvents[homeroom];
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
        last_sst_date_text: latestNoteDateText(300, student.sst_notes),
        events: studentTardyCounts[student.id] || 0
      });
    });

    return (
      <StudentsTable
        rows = {rows}
        selectedCategory = {this.state.selectedHomeroom}
        schoolYearFlag ={true}
        incidentType={"Tardies"}
        resetFn={this.resetStudentList}/>
    );
  }

  renderRangeSelector() {
    const ninetyDaysAgo = moment.utc().subtract(90, 'days').format("YYYY-MM-DD");
    const fortyFiveDaysAgo = moment.utc().subtract(45, 'days').format("YYYY-MM-DD");
    const schoolYearStart = DashboardHelpers.schoolYearStart();
    return (
      <div className="DashboardRangeButtons">
        <DashRangeButtons
          schoolYearFilter={() => this.setState({startDate: schoolYearStart})}
          ninetyDayFilter={() => this.setState({startDate: ninetyDaysAgo})}
          fortyFiveDayFilter={() => this.setState({startDate: fortyFiveDaysAgo})}/>
      </div>
    );
  }
}

SchoolTardiesDashboard.propTypes = {
  schoolTardyEvents: PropTypes.object.isRequired,
  dashboardStudents: PropTypes.array.isRequired
};

export default SchoolTardiesDashboard;
