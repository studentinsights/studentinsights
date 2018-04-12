import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import DashboardHelpers from '../DashboardHelpers';
import StudentsTable from '../StudentsTable';
import DashboardBarChart from '../DashboardBarChart';
import DateSlider from '../DateSlider';
import {latestNoteDateText} from '../../../helpers/latestNoteDateText';


class SchoolAbsenceDashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      displayDates: this.props.dateRange,
      selectedHomeroom: null
    };
    this.setDate = (range) => {
      this.setState({
        displayDates: DashboardHelpers.filterDates(this.props.dateRange,
                                                    moment.unix(range[0]).utc().format("YYYY-MM-DD"),
                                                    moment.unix(range[1]).utc().format("YYYY-MM-DD"))
      });
    };
    this.setStudentList = (highchartsEvent) => {
      this.setState({selectedHomeroom: highchartsEvent.point.category});
    };
    this.resetStudentList = () => {
      this.setState({selectedHomeroom: null});
    };
  }

  //Monthly attendance for the school must be calculated after the range filter is applied
  monthlySchoolAttendance(schoolAverageDailyAttendance) {
    let monthlySchoolAttendance = {};
    //Use the filtered daterange to find the days to include
    this.state.displayDates.forEach((day) => {
      let date = moment.utc(day).date(1).format("YYYY-MM"); //first day of the month in which 'day' occurs
      (monthlySchoolAttendance[date] === undefined) ? //if there's nothing for this month yet
      monthlySchoolAttendance[date] = [schoolAverageDailyAttendance[day]] :
      monthlySchoolAttendance[date] = monthlySchoolAttendance[date].concat(schoolAverageDailyAttendance[day]);
    });
    return monthlySchoolAttendance;
  }

  filteredHomeRoomAttendance(dailyHomeroomAttendance) {
    return _.map(dailyHomeroomAttendance, (homeroom) => {
      return this.state.displayDates.map((date) => {
        return homeroom[date];
      });
    });
  }

  studentAbsenceCounts() {
    let studentAbsenceCounts = {};
    this.state.displayDates.forEach((day) => {
      _.each(this.props.schoolAbsenceEvents[day], (absence) => {
        studentAbsenceCounts[absence.student_id] = studentAbsenceCounts[absence.student_id] || 0;
        studentAbsenceCounts[absence.student_id]++;
      });
    });
    return studentAbsenceCounts;
  }

  render() {
    return (
        <div className="DashboardContainer">
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
  }

  renderMonthlyAbsenceChart() {
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
  }

  renderHomeroomAbsenceChart() {
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
  }

  renderStudentAbsenceTable() {
    const studentAbsenceCounts = this.studentAbsenceCounts();
    const studentsByHomeroom = DashboardHelpers.groupByHomeroom(this.props.dashboardStudents);
    const students = studentsByHomeroom[this.state.selectedHomeroom] || this.props.dashboardStudents;
    let rows =[];
    students.forEach((student) => {
      rows.push({
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        last_sst_date_text: latestNoteDateText(300, student.event_notes),
        events: studentAbsenceCounts[student.id] || 0
      });
    });

    return (
      <StudentsTable
        rows = {rows}
        selectedCategory = {this.state.selectedHomeroom}/>
    );
  }

  renderDateRangeSlider() {
    const firstDate = DashboardHelpers.schoolYearStart();
    const lastDate = this.props.dateRange[this.props.dateRange.length - 1];
    return (
      <DateSlider
        rangeStart = {parseInt(moment.utc(firstDate).format("X"))}
        rangeEnd = {parseInt(moment.utc(lastDate).format("X"))}
        setDate={this.setDate}/>
    );
  }
}

SchoolAbsenceDashboard.propTypes = {
  schoolAverageDailyAttendance: PropTypes.object.isRequired,
  homeroomAverageDailyAttendance: PropTypes.object.isRequired,
  dashboardStudents: PropTypes.array.isRequired,
  schoolAbsenceEvents: PropTypes.object.isRequired,
  dateRange: PropTypes.array.isRequired
};

export default SchoolAbsenceDashboard;
