import React from 'react';
import _ from 'lodash';

import DashboardHelpers from './dashboard_helpers.jsx';
import AbsenceDashboardCharts from './absence_dashboard_charts.jsx';
import DateSlider from './date_slider.jsx';


export default React.createClass({
  displayName: 'AbsenceDashboardDateController',

  propTypes: {
    schoolAverageDailyAttendance: React.PropTypes.object.isRequired,
    homeroomAverageDailyAttendance: React.PropTypes.object.isRequired,
    dashboardStudents: React.PropTypes.array.isRequired,
    dateRange: React.PropTypes.array.isRequired
  },

  getInitialState: function() {
    return {
      filteredDateRange: this.props.dateRange
    };
  },

  filteredMonthlySchoolAttendance: function(monthlySchoolAttendance) {
    return Object.keys(monthlySchoolAttendance).map( (month) => {
      const rawAvg = _.sum(monthlySchoolAttendance[month])/monthlySchoolAttendance[month].length;
      return Math.round(rawAvg*10)/10;
    });
  },

  //Monthly attendance for the school must be calculated after the range filter is applied
  monthlySchoolAttendance: function(schoolAverageDailyAttendance) {
    let monthlySchoolAttendance = {};
    //Use the filtered daterange to find the days to include
    this.state.filteredDateRange.forEach((day) => {
      let date = moment(day).date(1).format("YYYY-MM-DD"); //first day of the month in which 'day' occurs
      (monthlySchoolAttendance[date] === undefined) ? //if there's nothing for this month yet
      monthlySchoolAttendance[date] = [schoolAverageDailyAttendance[day]] :
      monthlySchoolAttendance[date] = monthlySchoolAttendance[date].concat(schoolAverageDailyAttendance[day]);
    });
    return monthlySchoolAttendance;
  },

  filteredHomeRoomAttendance: function(dailyHomeroomAttendance) {
    return _.map(dailyHomeroomAttendance, (homeroom) => {
      return this.state.filteredDateRange.map((date) => {
        return homeroom[date];
      });
    });
  },

  studentAbsenceCount: function(absences) {
    return absences.filter((event) => {
      const start_date = this.state.filteredDateRange[0];
      const end_date = this.state.filteredDateRange[this.state.filteredDateRange.length-1];
      return moment.utc(event.occurred_at).isBetween(start_date, end_date, null, '[]');
    }).length;
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
          <div className="AbsenceDashboard">
            {this.renderAbsenceDashboardCharts()}
            {this.renderDateRangeSlider()}
          </div>
    );
  },

  renderAbsenceDashboardCharts: function() {
    const monthlyAttendance = this.monthlySchoolAttendance(this.props.schoolAverageDailyAttendance);
    const filteredSchoolAttendanceSeries = this.filteredMonthlySchoolAttendance(monthlyAttendance);
    const filteredHomeRoomAttendance = this.filteredHomeRoomAttendance(this.props.homeroomAverageDailyAttendance);
    const homeroomSeries = filteredHomeRoomAttendance.map((homeroom) => {
      const rawAvg = _.sum(homeroom)/homeroom.length;
      return Math.round(rawAvg*10)/10;
    });
    console.log(homeroomSeries);

    return (
        <AbsenceDashboardCharts
          filteredSchoolAttendanceSeries = {filteredSchoolAttendanceSeries}
          schoolAttendanceMonths = {Object.keys(monthlyAttendance)}
          filteredHomeRoomAttendanceSeries = {homeroomSeries}
          homerooms = {Object.keys(this.props.homeroomAverageDailyAttendance)}
          dashboardStudents = {this.props.dashboardStudents}
          dateRange = {this.state.filteredDateRange}/>
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
