import React from 'react';
import _ from 'lodash';
import StudentsTable from './students_table.jsx';
import DashboardBarChart from './dashboard_bar_chart.jsx';
import DateSlider from './date_slider.jsx';


window.shared || (window.shared = {});

export default React.createClass({
  displayName: 'SchoolAbsenceDashboard',

  propTypes: {
    schoolAttendance: React.PropTypes.object.isRequired,
    schoolAttendanceMonths: React.PropTypes.array.isRequired,
    homeRoomAttendance: React.PropTypes.object.isRequired,
    students: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      start_date: "2016-08-01",
      end_date: moment.utc().format("YYYY-MM-DD")
    };
  },

  getFirstDateIndex: function(dates, start_date) {
    for (let i = 0, max = dates.length; i < max; i++) {
      if (moment.utc(dates[i]).isSameOrAfter(start_date)) return i;
    }
    return dates.length;
  },

  getLastDateIndex: function(dates, end_date) {
    let result = dates.length;
    if (moment.utc(dates[dates.length]).isSameOrBefore(end_date)) return result;
    for (let i = dates.length; i--;) {
      if (moment.utc(dates[i]).isSameOrBefore(end_date)) return i+1;
    }
  },

  filterDates: function(dates, start_date, end_date) {
    return _.slice(dates, this.getFirstDateIndex(dates, start_date), this.getLastDateIndex(dates, end_date));
  },

  studentAbsenceCount: function(absences, start_date, end_date) {
    return absences.filter((event) => {
      return moment.utc(event.occurred_at).isBetween(start_date, end_date, null, '[]');
    }).length;
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
    const {GraphHelpers} = window.shared;
    let filteredDates = this.filterDates(this.props.schoolAttendanceMonths, this.state.start_date, this.state.end_date);
    let filteredAttendanceSeries = filteredDates.map( (month) => {
      const rawAvg = _.sum(this.props.schoolAttendance[month])/this.props.schoolAttendance[month].length;
      return Math.round(rawAvg*10)/10;
    });
    const categories = filteredDates.map((month) => moment.utc(month).format("YYYY-MM"));
    const yearCategories = GraphHelpers.yearCategories(categories);

    return (
        <DashboardBarChart
          id = {'string'}
          categories = {categories}
          seriesData = {filteredAttendanceSeries}
          monthsBack = {categories.length}
          titleText = {'Average Attendance By Month'}
          measureText = {'Attendance (Percent)'}
          categoryGroups = {{
            offset: 50,
            linkedTo: 0,
            categories: yearCategories,
            tickPositions: Object.keys(yearCategories).map(Number),
            tickmarkPlacement: "on"
          }}/>
    );
  },

  renderHomeroomAbsenceChart: function() {
    const homeRoomAttendance = this.props.homeRoomAttendance;
    let percentages = _.map(homeRoomAttendance, (homeroom) => {
      return this.filterDates(Object.keys(homeroom.absences).sort(), this.state.start_date, this.state.end_date).map((date) => {
        return homeroom.absences[date];
      });
    });
    let homeroomSeries = percentages.map((homeroom) => {
      const rawAvg = _.sum(homeroom)/homeroom.length;
      return Math.round(rawAvg*10)/10;
    });

    return (
        <DashboardBarChart
          id = {'string'}
          categories = {Object.keys(homeRoomAttendance)}
          seriesData = {homeroomSeries}
          monthsBack = {12}
          titleText = {'Average Attendance By Homeroom'}
          measureText = {'Attendance (Percent)'}/>
    );
  },

  renderStudentAbsenceTable: function () {
    let students =[];
    _.each(this.props.students.absences, (student) => {
      students.push({
        first_name: student.first_name,
        last_name: student.last_name,
        absences: this.studentAbsenceCount(student.absences, this.state.start_date, this.state.end_date)
      });
    });

    return (
        <StudentsTable
          rows = {students}/>
    );
  },

  renderDateRangeSlider: function() {
    return (
      <DateSlider
        setDate={(range) => this.setState({
          start_date: moment.unix(range[0]).format("YYYY-MM-DD"),
          end_date: moment.unix(range[1]).format("YYYY-MM-DD")
        })}/>
    );
  }
});
