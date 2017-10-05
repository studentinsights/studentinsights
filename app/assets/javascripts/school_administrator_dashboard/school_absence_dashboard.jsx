import DashboardBarChart from './dashboard_bar_chart.jsx';

export default React.createClass({
  displayName: 'SchoolAbsenceDashboard',

  propTypes: {
    attendanceData: React.PropTypes.object.isRequired
  },

  //Take all student absences, combine into single array, sort.
  // separate function to group elements by YYYY-MM, elements still need to be filterable by day

  schoolAbsences () {
    const attendanceData = this.props.attendanceData;
    var totalSchoolAbsences = [];
    //map each student absence object
    attendanceData.absences.map(function(student) { //this is stupid and there must be a better way. need to clean up use of absence in these functions
      student.absences.map(function(event) {
        totalSchoolAbsences.push(event);
      });
    });
    return totalSchoolAbsences;
  },

  totalStudents () {
    return this.props.attendanceData.size;
  },

  //Need to calculate the percentage attending. Should look like (per month):
  //(totalStudents() - (total absences this month))/totalStudents()
  //Next function should return number of absences in each month.

  render: function() {
    return (
      <div className="DashboardSnapshotsPage">
        <DashboardBarChart
          id = {'string'}
          events = {this.schoolAbsences()}
          totalStudents = {this.props.attendanceData.absences.length}
          monthsBack = {12}
          titleText = {'Attendance (Percent)'}/>
      </div>);
  }

});
