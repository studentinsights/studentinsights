import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import SelectTimeRange, {
  momentRange,
  TIME_RANGE_45_DAYS_AGO
} from '../../components/SelectTimeRange';
import {ALL} from '../../components/SimpleFilterSelect';
import {
  supportsHouse,
  shouldDisplayHouse,
  supportsCounselor,
  shouldDisplayCounselor
} from '../../helpers/PerDistrict';
import SelectDisciplineIncidentType from '../../components/SelectDisciplineIncidentType';
import SelectGrade from '../../components/SelectGrade';
import SelectHouse from '../../components/SelectHouse';
import SelectCounselor from '../../components/SelectCounselor';
import memoizer from '../../helpers/memoizer';
import FilterBar from '../../components/FilterBar';
import {sortByGrade} from '../../helpers/SortHelpers';
import ExperimentalBanner from '../../components/ExperimentalBanner';
import SectionHeading from '../../components/SectionHeading';
import EscapeListener from '../../components/EscapeListener';
import StudentsTable from '../StudentsTable';
import DashboardBarChart from '../DashboardBarChart';
import * as dashboardStyles from '../dashboardStyles';


export default class SchoolDisciplineDashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = initialState();
    this.onTimeRangeKeyChanged = this.onTimeRangeKeyChanged.bind(this);
    this.onIncidentTypeChange = this.onIncidentTypeChange.bind(this);
    this.onGradeChanged = this.onGradeChanged.bind(this);
    this.onHouseChanged = this.onHouseChanged.bind(this);
    this.onCounselorChanged = this.onCounselorChanged.bind(this);
    this.onResetFilters = this.onResetFilters.bind(this);
    this.onColumnClick = this.onColumnClick.bind(this);
    this.onResetStudentList = this.onResetStudentList.bind(this);
    this.onSelectChart = this.onSelectChart.bind(this);
    this.memoize = memoizer();
  }

  filterIncidents(disciplineIncidents, shouldFilterSelectedCategory) {
    return this.memoize(['filteredIncidents', this.state, arguments], () => {
      if (!disciplineIncidents) return [];
      const {nowFn} = this.context;
      const {timeRangeKey, selectedIncidentCode, selectedChart, selectedCategory} = this.state;
      const range = momentRange(timeRangeKey, nowFn());
      return disciplineIncidents.filter(incident => {
        if (!moment.utc(incident.occurred_at).isBetween(range[0], range[1])) return false;
        if (incident.incident_code !== selectedIncidentCode && selectedIncidentCode !== ALL) return false;
        if (shouldFilterSelectedCategory) { //used by the student list when a user selects a category within a chart
          if (selectedChart === 'day' && this.timeStampToDay(incident) !== selectedCategory) return false;
          if (selectedChart === 'time' &&  this.timeStampToHour(incident) !== selectedCategory) return false;
          if (selectedChart === 'incident_location' && incident[selectedChart] !== selectedCategory) return false;
          if (selectedChart === 'incident_code' && incident[selectedChart] !== selectedCategory) return false;
        }
        return true;
      });
    });
  }

  filterStudents(students, shouldFilterSelectedCategory) {
    const {selectedChart, selectedCategory, grade, house, counselor} = this.state;
    return students.filter(student => {
      if (grade !== ALL && student.grade !== grade) return false;
      if (house !== ALL && student.house !== house) return false;
      if (counselor !== ALL && student.counselor !== counselor) return false;
      if (selectedCategory && shouldFilterSelectedCategory) { //used by the student list when a user selects a category within a chart
        if (selectedChart === 'grade' && student.grade !== selectedCategory) return false;
        if (selectedChart === 'homeroom_label' && student.homeroom_label !== selectedCategory) return false;
        if (!this.filterIncidents(student.discipline_incidents, true).length) return false;
      }
      if (!this.filterIncidents(student.discipline_incidents, false).length) return false;
      return true;
    });
  }

  timeStampToHour(incident) {
    const hour = moment.utc(incident.occurred_at).startOf('hour').format('h:mm a');
    const timeFormat = "HH:mm a";
    const schoolStart = moment.utc("7:00 am", timeFormat);
    const schoolEnd = moment.utc("3:00 pm", timeFormat);
    if (!incident.has_exact_time) return "Not Logged";
    if (!moment.utc(hour, timeFormat).isBetween(schoolStart, schoolEnd)) return "Other";
    return hour;
  }

  timeStampToDay(incident) {
    return moment.utc(incident.occurred_at).format("ddd");
  }

  getIncidentsFromStudents(students) {
    //for chart data, does not filter on selected categories
    return _.flatten(students.map(student => this.filterIncidents(student.discipline_incidents, false)));
  }

  //Depending on the chart, incidents are grouped either by student attribute or incident attribute. Any future
  //charts may be handled here.
  getChartData(students, selectedChart) {
    switch(selectedChart) {
    case 'homeroom_label': {
      const groupedStudents = _.groupBy(students, selectedChart);
      const categories = this.sortedByIncidentsInStudentGroup(groupedStudents);
      const seriesData = categories.map(category => {
        const color = (category === this.state.selectedCategory)? 'orange' : null;
        const y = this.getIncidentsFromStudents(groupedStudents[category]).length;
        return {category, y, color};
      });
      return {categories, seriesData};
    }
    case 'grade': {
      const groupedStudents = _.groupBy(students, selectedChart);
      const categories = this.sortedGrades(Object.keys(groupedStudents));
      const seriesData = categories.map(category => {
        const color = (category === this.state.selectedCategory)? 'orange' : null;
        const y = this.getIncidentsFromStudents(groupedStudents[category]).length;
        return {category, y, color};
      });
      return {categories, seriesData};
    }
    case 'incident_location': {
      const incidents = this.getIncidentsFromStudents(students);
      const groupedIncidents = _.groupBy(incidents, selectedChart);
      const categories = this.sortedByIncidents(groupedIncidents);
      const seriesData = categories.map(category => {
        const color = (category === this.state.selectedCategory)? 'orange' : null;
        const y = groupedIncidents[category].length;
        return {category, y, color};
      });
      return {categories, seriesData};
    }
    case 'time': {
      const incidents = this.getIncidentsFromStudents(students);
      const groupedIncidents = _.groupBy(incidents, incident => {
        return this.timeStampToHour(incident);
      });
      const categories = this.sortedTimes(Object.keys(groupedIncidents));
      const seriesData = categories.map(category => {
        const color = (category === this.state.selectedCategory)? 'orange' : null;
        const y = groupedIncidents[category] ? groupedIncidents[category].length : 0;
        return {category, y, color};
      });
      return {categories, seriesData};
    }
    case 'day': {
      const incidents = this.getIncidentsFromStudents(students);
      const groupedIncidents = _.groupBy(incidents, incident => {
        return moment.utc(incident.occurred_at).format("ddd");
      });
      const categories = this.sortedDays();
      const seriesData = categories.map(category => {
        const color = (category === this.state.selectedCategory)? 'orange' : null;
        const y = groupedIncidents[category] ? groupedIncidents[category].length : 0;
        return {category, y, color};
      });
      return {categories, seriesData};
    }
    }
  }

  sortedDays() {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }

  sortedTimes(chartKeys) {
    //chartKeys will either contain a time like "4:00 pm", "10:00 am", or "Not Logged"
    return [
      "Not Logged",
      "7:00 am",
      "8:00 am",
      "9:00 am",
      "10:00 am",
      "11:00 am",
      "12:00 pm",
      "1:00 pm",
      "2:00 pm",
      "3:00 pm",
      "Other"];
  }

  sortedGrades(chartKeys) {
    return chartKeys.sort((a,b) => sortByGrade(a,b));
  }

  sortedByIncidents(groupedIncidents) {
    const chartKeys = Object.keys(groupedIncidents);
    return chartKeys.sort((a,b) => {
      return groupedIncidents[b].length - groupedIncidents[a].length;
    });
  }

  sortedByIncidentsInStudentGroup(groupedStudents) {
    return Object.keys(groupedStudents).sort((a,b) => {
      return this.getIncidentsFromStudents(groupedStudents[b]).length - this.getIncidentsFromStudents(groupedStudents[a]).length;
    });
  }

  studentTableRows(students) {
    const filteredStudents = this.filterStudents(students, true);
    const {selectedCategory} = this.state;
    return filteredStudents.map(student => {
      return {
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        grade: student.grade,
        latest_note: student.latest_note,
        events: this.filterIncidents(student.discipline_incidents, selectedCategory).length
      };
    });
  }

  allIncidentTypes() {
    const {dashboardStudents} = this.props;
    const incidents = _.uniqBy(_.compact(_.flatten(dashboardStudents.map(student => student.discipline_incidents))), 'incident_code');
    return incidents.map(incident => incident.incident_code).sort();
  }

  allGrades() {
    const {dashboardStudents} = this.props;
    return _.uniq(dashboardStudents.map(student => student.grade)).sort();
  }

  allCounselors() {
    const {dashboardStudents} = this.props;
    return _.uniq(dashboardStudents.map(student => student.counselor)).sort();
  }

  onIncidentTypeChange(incidentType) {
    this.setState({selectedIncidentCode: incidentType, selectedCategory: null});
  }

  onGradeChanged(grade) {
    this.setState({grade, selectedCategory: null});
  }

  onHouseChanged(house) {
    this.setState({house, selectedCategory: null});
  }

  onCounselorChanged(counselor) {
    this.setState({counselor, selectedCategory: null});
  }

  onTimeRangeKeyChanged(timeRangeKey) {
    this.setState({timeRangeKey});
  }

  onSelectChart(selection) {
    this.setState({selectedChart: selection.value, selectedCategory: null});
  }

  onResetFilters() {
    this.setState(initialState());
  }

  onColumnClick(highchartsEvent) {
    this.setState({selectedCategory: highchartsEvent.point.category});
  }

  onResetStudentList() {
    this.setState({selectedCategory: null});
  }

  render() {
    const {districtKey} = this.context;
    const {timeRangeKey, selectedChart, grade, house, counselor} = this.state;
    const {school, dashboardStudents} = this.props;
    const chartOptions = [
      {value: 'incident_location', label: 'Location'},
      {value: 'time', label: 'Time'},
      {value: 'homeroom_label', label: 'Classroom'},
      {value: 'grade', label: 'Grade'},
      {value: 'day', label: 'Day'}
    ];
    const incidentTypes = this.allIncidentTypes(dashboardStudents);

    return(
      <EscapeListener className="SchoolDisciplineDashboard" style={styles.flexVertical} onEscape={this.onResetFilters}>
        <ExperimentalBanner />
        <div style={{...styles.flexVertical, paddingLeft: 10, paddingRight: 10}}>
          <SectionHeading>Discipline incidents at {school.name}</SectionHeading>
          <div style={styles.filterBarContainer}>
            <FilterBar style={styles.timeRange} >
              <SelectDisciplineIncidentType
                type={this.state.selectedIncidentCode || 'All'}
                onChange={this.onIncidentTypeChange}
                types={incidentTypes} />
              <SelectGrade
                style={styles.narrowSelect}
                grade={grade}
                grades={this.allGrades()}
                onChange={this.onGradeChanged} />
              {supportsHouse(districtKey) && shouldDisplayHouse(school) && (
                <SelectHouse
                  style={styles.narrowSelect}
                  house={house}
                  onChange={this.onHouseChanged} />
              )}
              {supportsCounselor(districtKey) && shouldDisplayCounselor(school) && (
                <SelectCounselor
                  style={styles.narrowSelect}
                  counselor={counselor}
                  counselors={this.allCounselors()}
                  onChange={this.onCounselorChanged} />
              )}
            </FilterBar>
            <FilterBar style={styles.timeRange}>
              <SelectTimeRange
                timeRangeKey={timeRangeKey}
                onChange={this.onTimeRangeKeyChanged} />
            </FilterBar>
          </div>
          <div style={dashboardStyles.columns}>
            <div style={dashboardStyles.rosterColumn}>
              {this.renderStudentDisciplineTable(dashboardStudents)}
            </div>
            <div style={dashboardStyles.chartsColumn}>
              <div style={styles.graphTitle}>
                <div style={styles.titleText}>
                  Break down by:
                </div>
                <Select
                  value={this.state.selectedChart}
                  onChange={this.onSelectChart}
                  options={chartOptions}
                  style={styles.dropdown}
                  clearable={false}
                />
              </div>
             {this.renderDisciplineChart(dashboardStudents, selectedChart)}
            </div>
          </div>
        </div>
      </EscapeListener>
    );
  }

  renderDisciplineChart(students, selectedChart) {
    const selectedStudents = this.filterStudents(students, false);
    const {categories, seriesData} = this.getChartData(selectedStudents, selectedChart);
    return (
        <DashboardBarChart
          id = "String"
          animation = {false}
          categories = {{categories: categories}}
          seriesData = {seriesData}
          titleText = {null}
          measureText = {'Number of Incidents'}
          tooltip = {{
            pointFormat: 'Total incidents: <b>{point.y}</b>'}}
          onColumnClick = {this.onColumnClick}
          onBackgroundClick = {this.onResetStudentList}/>
    );
  }

  renderStudentDisciplineTable(students) {
    const rows = this.studentTableRows(students);
    return (
      <StudentsTable
        rows = {rows}
        selectedCategory = {this.state.selectedCategory}
        incidentType={"Incidents"}
        resetFn={this.onResetStudentList}/>
    );
  }
}
SchoolDisciplineDashboard.contextTypes = {
  nowFn: PropTypes.func.isRequired,
  districtKey: PropTypes.string.isRequired
};
SchoolDisciplineDashboard.propTypes = {
  dashboardStudents: PropTypes.array.isRequired,
  school: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired
};

const styles = {
  flexVertical: {
    flex: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  timeRange: {
    display: 'flex',
    justifyContent: 'center'
  },
  graphTitle: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px'
  },
  titleText: {
    fontSize: '18px',
    marginRight: '10px',
    alignSelf: 'center'
  },
  dropdown: {
    width: '200px'
  },
  filterBarContainer: {
    borderBottom: '1px solid #ccc',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 10
  },
  narrowSelect: {
    width: '8em'
  }
};

function initialState() {
  return {
    timeRangeKey: TIME_RANGE_45_DAYS_AGO,
    selectedChart: 'incident_location',
    selectedIncidentCode: ALL,
    selectedCategory: null,
    grade: ALL,
    house: ALL,
    counselor: ALL
  };
}
