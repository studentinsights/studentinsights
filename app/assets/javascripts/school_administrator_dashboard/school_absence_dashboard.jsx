import _ from 'lodash';
import DashboardBarChart from './dashboard_bar_chart.jsx';
//import GraphHelpers from '../helpers/graph_helpers.js';

window.shared || (window.shared = {});
const GraphHelpers = window.shared.GraphHelpers;

const styles = {
  box: {
    border: '1px solid #ccc',
    padding:15,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    backgroundColor: '#f2f2f2'
  },

};

export default React.createClass({
  displayName: 'SchoolAbsenceDashboard',

  propTypes: {
    attendanceData: React.PropTypes.object.isRequired
  },

  //Returns array of all absences for all students in the school
  schoolAbsences: function() {
    const attendanceData = this.props.attendanceData;
    var totalSchoolAbsences = [];
    //map each student absence object
    attendanceData.absences.map(function(student) {
      student.absences.map(function(event) {
        totalSchoolAbsences.push(event);
      });
    });
    return totalSchoolAbsences; //double check these values
  },

  //returns object which maps arrays of absences to the homeroom id's of the students.
  absencesByHomeroom: function() {
    //Group data by homeroom
    var homeRoomGroups = _.groupBy(this.props.attendanceData.absences, 'homeroom');

    //Simplify homeroom data into map of homerooms to total homeroom absences
    var homeroomAbsences = {};
    //To get keys for new object
    Object.keys(homeRoomGroups).map(function(key) {
      //Only include flat list of absence events
      homeroomAbsences[key] = {
        absences: GraphHelpers.eventsToDayBuckets(_.flattenDeep(_.map(homeRoomGroups[key], function(student) {
          return student.absences;
        }))),
        size: homeRoomGroups[key].length
      };
    });
    return homeroomAbsences;
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
    return buckets.map(function(bucket) {
      return (students - bucket.length)/students*100;
    });
  },

  render: function() {
    return (
      <div className="DashboardSnapshotsPage">
      {this.renderMonthlyAbsenceChart()}
      {this.renderHomeroomAbsenceChart()}
      {this.renderCharts()}
      </div>
    );
  },

  renderMonthlyAbsenceChart: function() {
    return (
      <DashboardBarChart
        id = {'string'}
        categories = {this.createMonthKeys().map(GraphHelpers.monthAxisCaption)}
        seriesData = {this.getAttendancePercentage(this.createMonthBuckets(this.schoolAbsences()), this.totalStudents())}
        totalStudents = {this.totalStudents()}
        monthsBack = {12}
        titleText = {'Attendance (Percent)'}/>
    );
  },

  renderHomeroomAbsenceChart: function() {
    const homerooms = this.absencesByHomeroom();
    const dayAvg = _.map(homerooms,function(homeroom) {
      return _.map(homeroom.absences, function(dayCount) {
        return (homeroom.size - dayCount.length)/homeroom.size*100;
      });
    });
    const series = _.map(dayAvg, function(day) {
      return _.sum(day)/day.length;
    });
    return (
      <DashboardBarChart
        id = {'string'}
        categories = {Object.keys(homerooms)}
        seriesData = {series}
        totalStudents = {this.totalStudents()}
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
