import _ from 'lodash';
import DashboardBarChart from './dashboard_bar_chart.jsx';
//import GraphHelpers from '../helpers/graph_helpers.js';

window.shared || (window.shared = {});
const GraphHelpers = window.shared.GraphHelpers;

const styles = {
  chartBox: {
    border: '1px solid #ccc',
    padding:15,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    backgroundColor: '#f2f2f2'
  },
  chartContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    marginLeft: '50px',
    marginRight: 'auto',
    width: '65%',
  },
  studentListContainer: {

  },
  dateRangeContainer: {

  }
};

export default React.createClass({
  displayName: 'SchoolAbsenceDashboard',

  propTypes: {
    attendanceData: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      start_date: "2015-01-01",
      end_date: moment.utc().format("YYYY-MM-DD")
    };
  },

  //returns map of homerooms to absence events
  absencesByHomeroom: function() {
    //Group data by homeroom
    const homeRoomGroups = _.groupBy(this.props.attendanceData.absences, 'homeroom');
    let homeroomAbsences = {};
    //Simplify homeroom data into map of homerooms to total homeroom absences along with homeroom size
    Object.keys(homeRoomGroups).forEach( (key) => {
      const size = homeRoomGroups[key].length;
      var key2 = key;
      if (key == "null") key2 = "No Homeroom";
      homeroomAbsences[key2] = {
        //Group events into day buckets
        absences: this.eventsGroupedByDay(_.flattenDeep(_.map(homeRoomGroups[key], function(student) {
          return student.absences;
        }))),
        size: size
      };
    });
    return homeroomAbsences;
  },

  //Returns a list of homerooms along with dates and attendance percentage for each
  attendanceByHomeroom: function () {
    let homeroomDays = this.absencesByHomeroom();
    Object.keys(homeroomDays).forEach((homeroom) => {
      homeroomDays[homeroom].absences = this.averageDailyAttendance(homeroomDays[homeroom].absences, homeroomDays[homeroom].size);
    });
    return homeroomDays;
  },

  //Returns list of dates along with attendance percentage for all active students in school
  attendanceBySchool: function() {
    let schoolAbsences = {};
    const homerooms = this.absencesByHomeroom();
    Object.keys(homerooms).forEach((key) => {
      this.mergeDateLists(schoolAbsences, homerooms[key].absences);
    });
    const schoolAttendance = this.averageDailyAttendance(schoolAbsences, this.totalStudents());
    return schoolAttendance;
  },

  //Returns average monthly attendance givenn set of daily averages. To be used after applying date filters.
  monthlyAttendanceBySchool: function () {
    const schoolAttendance = this.attendanceBySchool();
    let monthlyAttendance = {};
    Object.keys(schoolAttendance).forEach((day) => {
      if (monthlyAttendance[moment(day).date(1).format("YYYY-MM-DD")] === undefined) {
        monthlyAttendance[moment(day).date(1).format("YYYY-MM-DD")] = [schoolAttendance[day]];
      } else {
        monthlyAttendance[moment(day).date(1).format("YYYY-MM-DD")].push(...schoolAttendance[day]);
      }
    });
    return monthlyAttendance;
  },

  averageDailyAttendance: function(dailyAbsences, size) {
    let averageDailyAttendance = {};
    //mapping each homeroom to an array of day buckets containing all absences for each day w/in the homeroom
    Object.keys(dailyAbsences).forEach((day) => {
      averageDailyAttendance[day] = (size - dailyAbsences[day].length)/size*100;
    });
    return averageDailyAttendance;
  },

  mergeDateLists: function(list1, list2) {
    Object.keys(list2).map((key) => {
      if (list1[key] === undefined) list1[key] = list2[key];
      else list1[key].push(...list2[key]);
    });
    return list1;
  },

  //takes array of events and groups by day on which they occurred
  eventsGroupedByDay: function(events) {
    return _.groupBy(events, (event) => {
      return moment.utc(event.occurred_at).format("YYYY-MM-DD");
    });
  },

  totalStudents: function() {
    return this.props.attendanceData.absences.length;
  },

  createMonthBuckets: function (absences) {
    const monthKeys = this.createMonthKeys();
    return GraphHelpers.eventsToMonthBuckets(monthKeys, absences);
  },

  createMonthKeys: function() {
    return GraphHelpers.monthKeys(moment.utc(), 12); //12 here just gives a year, should be change w/ slider state
  },

  createYearCategories: function() {
    //not clear why to put this in chart yet
    return GraphHelpers.yearCategories(this.createMonthKeys());
  },

  //Month buckets for monthly averages
  //Day buckets for daily averages
  getAttendancePercentage: function(buckets, students){
    return _.map(buckets, function(bucket) {
      return (students - bucket.length)/students*100;
    });
  },

  getFirstDateIndex: function(dates, start_date) {
    var result = start_date;
    for (var i = 0, max = dates.length; i < max; i++) {
      if (dates[i] >= start_date) return i-1; //TODO see if performance is improved if this just takes an array of timestamps
    }
    return result;
  },

  getLastDateIndex: function(dates, end_date) {
    var result = end_date;
    for (var i = dates.length; i--;) {
      if (dates[i] <= end_date) return i+1; //TODO see if performance is improved if this just takes an array of timestamps
    }
    return result;
  },

  render: function() {
    return (
      <div className="DashboardSnapshotsPage" style={styles.chartContainer}>
      {this.renderMonthlyAbsenceChart()}
      {this.renderHomeroomAbsenceChart()}
      {this.renderCharts()}
      </div>
    );
  },

  renderMonthlyAbsenceChart: function() {
    const schoolEvents = this.monthlyAttendanceBySchool();
    let schoolSeries = _.map(schoolEvents, (month) => {
      return _.sum(month)/month.length;
    });

    return (
      <DashboardBarChart
        id = {'string'}
        categories = {this.createMonthKeys().map(GraphHelpers.monthAxisCaption)}
        seriesData = {schoolSeries}
        monthsBack = {12}
        titleText = {'Attendance (Percent)'}/>
    );
  },

  renderHomeroomAbsenceChart: function() {
    const homerooms = this.attendanceByHomeroom();
    //Insert filtering here
    var homeroomSeries = _.map(homerooms, (homeroom) => {
      var percentages = _.map(homeroom.absences);
      return _.sum(percentages)/percentages.length;
    });

    return (
      <DashboardBarChart
        style = {styles.chartBox}
        id = {'string'}
        categories = {Object.keys(homerooms)}
        seriesData = {homeroomSeries}
        monthsBack = {12}
        titleText = {'Attendance (Percent)'}/>
    );
  },

  renderCharts: function() {
    return (
      <div style={styles.box}>
      </div>
    );
  }
});
