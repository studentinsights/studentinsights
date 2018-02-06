import React from 'react';

import DashboardHelpers from '../dashboard_helpers.jsx';
import StudentsTable from '../students_table.jsx';
import DashboardBarChart from '../dashboard_bar_chart.jsx';


export default React.createClass({
  displayName: 'SchoolTardiesDashboard',

  propTypes: {
    schoolTardyEvents: React.PropTypes.object.isRequired,
    homeroomTardyEvents: React.PropTypes.object.isRequired,
    dashboardStudents: React.PropTypes.array.isRequired
  },

  getInitialState: function() {
    return {
      selectedHomeroom: null
    };
  },

  createMonthCategories: function(eventsByDay) {
    let monthCategories = {};
    let lastStoredMonth;
    const startMonth = moment().subtract(3, 'months');

    Object.keys(eventsByDay).sort().forEach((day, dayIndex) => {
      const month = moment(day);
      if (lastStoredMonth != month.date(1).format("MMM 'YY") && month.isSameOrAfter(startMonth, 'month')) {
        lastStoredMonth = month.date(1).format("MMM 'YY");
        monthCategories[dayIndex] = lastStoredMonth;
      }
    });
    return monthCategories;
  },

  getDatesForPastThreeMonths: function() {
    const today = moment().format('YYYY-MM-DD');
    let datesForPastThreeMonths = [];
    let date = moment().subtract(3, 'months').format('YYYY-MM-DD');
    while (moment(date).isBefore(moment(today))) {
      datesForPastThreeMonths.push(date);
      date = moment(date).add(1, 'day').format('YYYY-MM-DD');
    }
    return datesForPastThreeMonths;
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
            {this.renderMonthlyTardiesChart()}
            {this.renderHomeroomTardiesChart()}
          </div>
          <div className="DashboardRosterColumn">
            {this.renderStudentTardiesTable()}
          </div>
        </div>
    );
  },

  renderMonthlyTardiesChart: function() {
    const seriesData = this.getDatesForPastThreeMonths().map((date) => {
      if (this.props.schoolTardyEvents[date] === undefined) this.props.schoolTardyEvents[date] = [];
      return [moment(date).format('ddd MM/DD'), this.props.schoolTardyEvents[date].length];
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
  },

  renderHomeroomTardiesChart: function() {
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
  },

  renderStudentTardiesTable: function () {
    const studentsByHomeroom = DashboardHelpers.groupByHomeroom(this.props.dashboardStudents);
    const students = studentsByHomeroom[this.state.selectedHomeroom] || this.props.dashboardStudents;
    let rows =[];
    students.forEach((student) => {
      rows.push({
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        events: student.tardies.length || 0
      });
    });

    return (
      <StudentsTable
        rows = {rows}
        selectedHomeroom = {this.state.selectedHomeroom}/>
    );
  }
});
