import React from 'react';
import _ from 'lodash';

import DashboardHelpers from '../dashboard_helpers.jsx';
import StudentsTable from '../students_table.jsx';
import DashboardBarChart from '../dashboard_bar_chart.jsx';
import DateSlider from '../date_slider.jsx';


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
      return this.props.schoolTardyEvents[date].length;
    });

    return (
        <DashboardBarChart
          id = {'string'}
          categories = {Object.keys(this.props.schoolTardyEvents).sort()}
          seriesData = {seriesData}
          monthsBack = {12}
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
          categories = {homerooms}
          seriesData = {homeroomSeries}
          monthsBack = {12}
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
