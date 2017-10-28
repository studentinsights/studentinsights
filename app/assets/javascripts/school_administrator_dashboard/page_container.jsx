import _ from 'lodash';
import SchoolAbsenceDashboard from './school_absence_dashboard.jsx';

export default React.createClass({
  displayName: 'DashboardPageContainer',

  propTypes: {
    attendanceData: React.PropTypes.object.isRequired  //should rename more generically
  },

  //necessary?
  // studentAbsences: function () {
  //   const students = this.props.attendanceData;

  // },

  //returns map of homerooms to absence events
  absencesByHomeroom: function() {
    //Group data by homeroom
    const homeRoomGroups = _.groupBy(this.props.attendanceData.absences, 'homeroom');
    let homeroomAbsences = {};
    //Simplify homeroom data into map of homerooms to total homeroom absences along with homeroom size
    Object.keys(homeRoomGroups).forEach( (key) => {
      const size = homeRoomGroups[key].length;
      let key2 = key;
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

  //Month buckets for monthly averages
  //Day buckets for daily averages
  getAttendancePercentage: function(buckets, students){
    return _.map(buckets, function(bucket) {
      return (students - bucket.length)/students*100;
    });
  },

  render: function() {
    const schoolAttendance = this.monthlyAttendanceBySchool();
    const schoolAttendanceMonths = Object.keys(schoolAttendance).sort();
    const homeRoomAttendance = this.attendanceByHomeroom();

    return (
        <SchoolAbsenceDashboard
          schoolAttendance = {schoolAttendance}
          schoolAttendanceMonths = {schoolAttendanceMonths}
          homeRoomAttendance = {homeRoomAttendance}
          students = {this.props.attendanceData}/>);
  }
});

