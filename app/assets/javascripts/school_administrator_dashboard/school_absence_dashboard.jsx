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
    homeRoomAttendance: React.PropTypes.object.isRequired,
    students: React.PropTypes.object.isRequired,
    dateRange: React.PropTypes.array.isRequired
  },

  getInitialState: function() {
    return {
      display_dates: this.props.dateRange
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
    return dates.sort().slice(this.getFirstDateIndex(dates, start_date), this.getLastDateIndex(dates, end_date));
  },

  studentAbsenceCount: function(absences) {
    return absences.filter((event) => {
      const start_date = this.state.display_dates[0];
      const end_date = this.state.display_dates[this.state.display_dates.length-1];
      return moment.utc(event.occurred_at).isBetween(start_date, end_date, null, '[]');
    }).length;
  },

  //Monthly attendance for the school must be calculated after the range filter is applied
  monthlySchoolAttendance: function(dailyAttendance) {
    let monthlyAttendance = {};
    //Use the filtered daterange to find the days to include
    this.state.display_dates.forEach((day) => {
      //'date' here is the first day of the month in which 'day' occurs
      let date = moment(day).date(1).format("YYYY-MM-DD");
      if (monthlyAttendance[date] === undefined) { //if there's no data for this month yet
        monthlyAttendance[date] = [dailyAttendance[day]];
      } else {
        monthlyAttendance[date]= monthlyAttendance[date].concat(dailyAttendance[day]); //if there is data, append this day's absences to what exists already
      }
    });
    return monthlyAttendance;
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
    const monthlyAttendance = this.monthlySchoolAttendance(this.props.schoolAttendance);
    const filteredAttendanceSeries = Object.keys(monthlyAttendance).map( (month) => {
      const rawAvg = _.sum(monthlyAttendance[month])/monthlyAttendance[month].length;
      return Math.round(rawAvg*10)/10;
    });
    const categories = Object.keys(monthlyAttendance);

    return (
        <DashboardBarChart
          id = {'string'}
          categories = {categories}
          seriesData = {filteredAttendanceSeries}
          monthsBack = {categories.length}
          titleText = {'Average Attendance By Month'}
          measureText = {'Attendance (Percent)'}/>
    );
  },

  renderHomeroomAbsenceChart: function() {
    const homeRoomAttendance = this.props.homeRoomAttendance;
    const filteredHomeRoomAttendance = _.map(homeRoomAttendance, (homeroom) => {
      return this.state.display_dates.map((date) => {
        return homeroom.absences[date];
      });
    });
    const homeroomSeries = filteredHomeRoomAttendance.map((homeroom) => {
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
        absences: this.studentAbsenceCount(student.absences)
      });
    });

    return (
        <StudentsTable
          rows = {students}/>
    );
  },

  renderDateRangeSlider: function() {
    const firstDate = this.props.dateRange[0];
    const lastDate = this.props.dateRange[this.props.dateRange.length - 1];
    return (
      <DateSlider
        rangeStart = {parseInt(moment(firstDate).format("X"))}
        rangeEnd = {parseInt(moment(lastDate).format("X"))}
        setDate={(range) => this.setState({
          display_dates: this.filterDates(this.props.dateRange,
                                      moment.unix(range[0]).format("YYYY-MM-DD"),
                                      moment.unix(range[1]).format("YYYY-MM-DD"))
        })}/>
    );
  }
});
