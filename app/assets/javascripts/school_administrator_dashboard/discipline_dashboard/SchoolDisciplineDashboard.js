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
import SelectDisciplineIncidentType from '../../components/SelectDisciplineIncidentType';
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
    this.onResetFilters = this.onResetFilters.bind(this);
    this.setStudentList = this.setStudentList.bind(this);
    this.resetStudentList = this.resetStudentList.bind(this);
    this.selectChart = this.selectChart.bind(this);
    this.memoize = memoizer();
  }

  setStudentList(highchartsEvent) {
    this.setState({selectedCategory: highchartsEvent.point.category});
  }
  resetStudentList() {
    this.setState({selectedCategory: null});
  }
  selectChart(selection) {
    this.setState({selectedChart: selection.value, selectedCategory: null});
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

  filterStudents(students) {
    const {selectedChart, selectedCategory} = this.state;
    return students.filter(student => {
      if (selectedCategory && selectedChart === 'grade' && student.grade !== selectedCategory) return false;
      if (selectedCategory && selectedChart === 'race' && student.race !== selectedCategory) return false;
      if (selectedCategory && selectedChart === 'homeroom_label' && student.homeroom_label !== selectedCategory) return false;
      if (selectedCategory && !this.filterIncidents(student.discipline_incidents, true).length) return false;
      if (!this.filterIncidents(student.discipline_incidents, false).length) return false;
      return true;
    });
  }

  timeStampToHour(incident) {
    return incident.has_exact_time ? moment.utc(incident.occurred_at).startOf('hour').format('h:mm a') : "Not Logged";
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
  getChartData(students, group) {
    switch(group) {
    case 'homeroom_label': case 'race': {
      const groupedStudents = _.groupBy(students, group);
      const categories = this.sortedByIncidentsInStudentGroup(groupedStudents);
      const seriesData = categories.map(category => {
        return this.getIncidentsFromStudents(groupedStudents[category]).length;
      });
      return {categories, seriesData};
    }
    case 'grade': {
      const groupedStudents = _.groupBy(students, group);
      const categories = this.sortedGrades(Object.keys(groupedStudents));
      const seriesData = categories.map(category => {
        return this.getIncidentsFromStudents(groupedStudents[category]).length;
      });
      return {categories, seriesData};
    }
    case 'incident_code': case 'incident_location': {
      const incidents = this.getIncidentsFromStudents(students);
      const groupedIncidents = _.groupBy(incidents, group);
      const categories = this.sortedByIncidents(groupedIncidents);
      const seriesData = categories.map(category => groupedIncidents[category].length);
      return {categories, seriesData};
    }
    case 'time': {
      const incidents = this.getIncidentsFromStudents(students);
      const groupedIncidents = _.groupBy(incidents, incident => {
        return incident.has_exact_time ? moment.utc(incident.occurred_at).startOf('hour').format('h:mm a') : "Not Logged";
      });
      const categories = this.sortedTimes(Object.keys(groupedIncidents));
      const seriesData = categories.map(category => {
        return groupedIncidents[category] ? groupedIncidents[category].length : 0;
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
        return groupedIncidents[category] ? groupedIncidents[category].length : 0;
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
    return ["Not Logged",
            "12:00 am",
            "1:00 am",
            "2:00 am",
            "3:00 am",
            "4:00 am",
            "5:00 am",
            "6:00 am",
            "7:00 am",
            "8:00 am",
            "9:00 am",
            "10:00 am",
            "11:00 am",
            "12:00 pm",
            "1:00 pm",
            "2:00 pm",
            "3:00 pm",
            "4:00 pm",
            "5:00 pm",
            "6:00 pm",
            "7:00 pm",
            "8:00 pm",
            "9:00 pm",
            "10:00 pm",
            "11:00 pm",]
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
    const filteredStudents = this.filterStudents(students);
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

  allIncidentTypes(students) {
    return _.uniqBy(_.flatten(students.map(student => student.discipline_incidents)), 'incident_code')
    .map(incident => incident.incident_code);
  }

  onIncidentTypeChange(incidentType) {
    this.setState({selectedIncidentCode: incidentType});
  }

  onTimeRangeKeyChanged(timeRangeKey) {
    this.setState({timeRangeKey});
  }

  onResetFilters() {
    this.setState(initialState());
  }

  render() {
    const {timeRangeKey, selectedChart} = this.state;
    const {school, dashboardStudents} = this.props;
    const chartOptions = [
      {value: 'incident_location', label: 'Location'},
      {value: 'time', label: 'Time'},
      {value: 'homeroom_label', label: 'Classroom'},
      {value: 'grade', label: 'Grade'},
      {value: 'day', label: 'Day'},
      {value: 'incident_code', label: 'Offense'},
    ];
    const incidentTypes = this.allIncidentTypes(dashboardStudents);

    return(
      <EscapeListener className="SchoolDisciplineDashboard" style={styles.flexVertical} onEscape={this.onResetFilters}>
        <ExperimentalBanner />
        <div style={{...styles.flexVertical, paddingLeft: 10, paddingRight: 10}}>
          <SectionHeading>Discipline incidents at {school.name}</SectionHeading>
          <div style={dashboardStyles.filterBar}>
            <FilterBar style={styles.timeRange} >
              <SelectDisciplineIncidentType
              type={this.state.selectedIncidentCode || 'All'}
              onChange={this.onIncidentTypeChange}
              types={incidentTypes}/>
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
                  onChange={this.selectChart}
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
    const {categories, seriesData} = this.getChartData(students, selectedChart);
    return (
        <DashboardBarChart
          id = "Discipline"
          categories = {{categories: categories}}
          seriesData = {seriesData}
          titleText = {null}
          measureText = {'Number of Incidents'}
          tooltip = {{
            pointFormat: 'Total incidents: <b>{point.y}</b>'}}
          onColumnClick = {this.setStudentList}
          onBackgroundClick = {this.resetStudentList}/>
    );
  }

  renderStudentDisciplineTable(students) {
    const rows = this.studentTableRows(students);
    return (
      <StudentsTable
        rows = {rows}
        selectedCategory = {this.state.selectedCategory}
        incidentType={"Incidents"}
        resetFn={this.resetStudentList}/>
    );
  }
}
SchoolDisciplineDashboard.contextTypes = {
  nowFn: PropTypes.func.isRequired
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
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end'
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
  }
};

function initialState() {
  return {
    timeRangeKey: TIME_RANGE_45_DAYS_AGO,
    selectedChart: 'incident_location',
    selectedIncidentCode: ALL,
    selectedCategory: null
  };
}
