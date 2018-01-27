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

    Object.keys(eventsByDay).sort().forEach((day, dayIndex) => {
      const month = moment(day).date(1).format("MMM 'YY");
      if (lastStoredMonth != month) {
        monthCategories[dayIndex] = month;
        lastStoredMonth = month;
      }
    });
    return monthCategories;
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
    const seriesData = Object.keys(this.props.schoolTardyEvents).sort().map((date) => {
      return [moment(date).format('ddd MM/DD'), this.props.schoolTardyEvents[date].length];
    });
    const monthCategories = this.createMonthCategories(this.props.schoolTardyEvents);

    return (
        <DashboardBarChart
          id = {'string'}
          categories = {{
            offset: 0,
            linkedTo: 0,
            categories: monthCategories,
            tickPositions: Object.keys(monthCategories).map(Number),
            tickmarkPlacement: "on"
          }}
          seriesData = {seriesData}
          titleText = {'Schoolwide Tardies'}
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
          titleText = {'Tardies By Homeroom'}
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
