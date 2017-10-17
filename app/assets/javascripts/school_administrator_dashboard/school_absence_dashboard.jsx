import _ from 'lodash';
import DashboardBarChart from './dashboard_bar_chart.jsx';

window.shared || (window.shared = {});

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
    schoolAttendance: React.PropTypes.object.isRequired,
    schoolAttendanceMonths: React.PropTypes.array.isRequired,
    homeRoomAttendance: React.PropTypes.object.isRequired,
    homeRoomAttendanceMonths: React.PropTypes.array.isRequired
  },

  getInitialState: function() {
    return {
      start_date: "2015-01-01",
      end_date: moment.utc().format("YYYY-MM-DD")
    };
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
    const schoolAttendance = this.props.schoolAttendance;
    const schoolAttendanceMonths = this.props.schoolAttendanceMonths;
    //Apply filter to object keys
    let filteredDates = _.slice(schoolAttendanceMonths,
                                this.getFirstDateIndex(schoolAttendanceMonths,this.state.start_date),
                                this.getLastDateIndex(schoolAttendanceMonths,this.state.end_date)
                                );
    let filteredAttendanceSeries = filteredDates.map( (month) => {
      return _.sum(schoolAttendance[month])/schoolAttendance[month].length;
    });
    const categories = filteredDates.map((month) => moment.utc(month).format("YYYY-MM"));
    // const yearCategories = GraphHelpers.yearCategories(categories);

    return (
      <DashboardBarChart
        id = {'string'}
        categories = {categories}
        seriesData = {filteredAttendanceSeries}
        monthsBack = {categories.length}
        titleText = {'Attendance (Percent)'}/>
    );
  },

  renderHomeroomAbsenceChart: function() {
    const homeRoomAttendance = this.props.homeRoomAttendance;
    //Insert filtering here
    var homeroomSeries = _.map(homeRoomAttendance, (homeroom) => {
      var percentages = _.map(homeroom.absences);
      return _.sum(percentages)/percentages.length;
    });

    return (
      <DashboardBarChart
        style = {styles.chartBox}
        id = {'string'}
        categories = {Object.keys(homeRoomAttendance)}
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
