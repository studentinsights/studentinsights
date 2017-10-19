import _ from 'lodash';
// import Slider from 'rc-slider';
// // import InputRange from 'react-input-range';
// import {Table, Column, Cell} from 'fixed-data-table';
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
      if (dates[i] >= start_date) return i;
    }
    return dates.length;
  },

  getLastDateIndex: function(dates, end_date) {
    let result = dates.length;
    if (dates[dates.length] >= end_date) return result;
    for (let i = dates.length; i--;) {
      if (dates[i] <= end_date) return i+1;
    }
  },

  filterDates: function(dates, start_date, end_date) {
    return _.slice(dates, this.getFirstDateIndex(dates, start_date), this.getLastDateIndex(dates, end_date));
  },

  studentAbsenceCount: function(absences, start_date, end_date) {
    return absences.map((event) => {
      let occurance = moment.utc(event.occurred_at);
      if (occurance >= start_date && occurance <= end_date) return event;
    }).length;
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
    let filteredDates = this.filterDates(this.props.schoolAttendanceMonths, this.state.start_date, this.state.end_date);
    let filteredAttendanceSeries = filteredDates.map( (month) => {
      return _.sum(this.props.schoolAttendance[month])/this.props.schoolAttendance[month].length;
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
    let percentages = _.map(homeRoomAttendance, (homeroom) => {
      return this.filterDates(Object.keys(homeroom.absences), this.state.start_date, this.state.end_date).map((date) => {
        return homeroom.absences[date];
      });
    });
    let homeroomSeries = percentages.map((homeroom) => {
      return _.sum(homeroom)/homeroom.length;
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

  // renderStudentAbsenceTable: function () {
  //   const students = this.props.students;
  //   let tableRows = _.map(students.absences, (student) => {
  //     return [student.first_name, student.last_name, this.studentAbsenceCount(student.absences)];
  //   });

  //   return (
  //     <Table
  //       rowHeight={50}
  //       rowsCount={tableRows.length}
  //       width={5000}
  //       height={5000}
  //       headerHeight={50}>
  //       <Column
  //         header={<Cell>Col 1</Cell>}
  //         cell={<Cell>Column 1 static content</Cell>}
  //         width={2000}
  //       />
  //       <Column
  //         header={<Cell>Col 2</Cell>}
  //         cell={<Cell>Column 2 static content</Cell>}
  //         width={1000}
  //       />
  //       <Column
  //         header={<Cell>Col 3</Cell>}
  //         cell={({rowIndex, ...props}) => (
  //           <Cell {...props}>
  //             Data for column 3: {tableRows[rowIndex][2]}
  //           </Cell>
  //         )}
  //         width={2000}
  //         />
  //       </Table>
  //   );
  // },

  // renderDateRangeSlider: function() {
  //   return (
  //     <InputRange
  //       maxValue={moment.utc().format("YYYY-MM-DD")}
  //       minValue={"2016-08-01"}
  //       value={2}
  //       onChange={value => this.setState({ start_time })} />
  //   );
  // },

  renderCharts: function() {
    return (
      <div style={styles.box}>
      </div>
    );
  }
});
