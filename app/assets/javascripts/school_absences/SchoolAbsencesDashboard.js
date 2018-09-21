import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import memoizer from '../helpers/memoizer';
import {
  supportsExcusedAbsences,
  supportsHouse,
  shouldDisplayHouse,
  supportsCounselor,
  shouldDisplayCounselor
} from '../helpers/PerDistrict';
import SectionHeading from '../components/SectionHeading';
import EscapeListener from '../components/EscapeListener';
import FilterBar from '../components/FilterBar';
import SelectTimeRange, {
  momentRange,
  timeRangeText,
  TIME_RANGE_45_DAYS_AGO
} from '../components/SelectTimeRange';
import {ALL} from '../components/SimpleFilterSelect';
import SelectGrade from '../components/SelectGrade';
import SelectHouse from '../components/SelectHouse';
import SelectCounselor from '../components/SelectCounselor';
import DashboardBarChart from '../school_administrator_dashboard/DashboardBarChart';
import * as dashboardStyles from '../school_administrator_dashboard/dashboardStyles';
import StudentsTable from './StudentsTable';
import SelectExcusedAbsences, {
  EXCLUDE_EXCUSED_ABSENCES,
  ALL_ABSENCES
} from './SelectExcusedAbsences';


export default class SchoolAbsencesDashboard extends React.Component {
  constructor(props, context) {
    super(props);

    this.state = initialState(props, context);
    this.onResetFilters = this.onResetFilters.bind(this);
    this.onExcusedAbsencesChanged = this.onExcusedAbsencesChanged.bind(this);
    this.onGradeChanged = this.onGradeChanged.bind(this);
    this.onHouseChanged = this.onHouseChanged.bind(this);
    this.onCounselorChanged = this.onCounselorChanged.bind(this);
    this.onTimeRangeKeyChanged = this.onTimeRangeKeyChanged.bind(this);
    this.onClearHomeroomSelected = this.onClearHomeroomSelected.bind(this);
    this.onBarChartColumnClicked = this.onBarChartColumnClicked.bind(this);
    this.memoize = memoizer();
  }

  // Props changes won't happen as this component is currently written,
  // so this is just defensive.
  componentWillReceiveProps() {
    this.memoize = memoizer();
  }

  shouldIncludeExcusedAbsences() {
    const {excusedAbsencesKey} = this.state;
    return excusedAbsencesKey === ALL_ABSENCES;
  }

  filteredStudents(options = {}) {
    const {studentsWithAbsences} = this.props;
    const {homeroomLabel, grade, house, counselor} = this.state;
    const shouldFilterByHomeroom = !options.includeAllHomerooms;
    return studentsWithAbsences.filter(student => {
      if (shouldFilterByHomeroom && homeroomLabel !== null && student.homeroom_label !== homeroomLabel) return false;
      if (grade !== ALL && student.grade !== grade) return false;
      if (house !== ALL && student.house !== house) return false;
      if (counselor !== ALL && student.counselor !== counselor) return false;
      
      return true;
    });
  }

  filteredAbsences(absences, endMoment) {
    const {timeRangeKey} = this.state;
    const range = momentRange(timeRangeKey, endMoment);
    return absences.filter(absence => {
      if (!moment.utc(absence.occurred_at).isBetween(range[0], range[1])) return false;
      if (!this.shouldIncludeExcusedAbsences() && absence.excused) return false;
      return true;
    });
  }

  allGrades() {
    const {studentsWithAbsences} = this.props;
    return _.sortBy(_.uniq(_.compact(studentsWithAbsences.map(student => student.grade))));
  }

  allCounselors() {
    const {studentsWithAbsences} = this.props;
    return _.sortBy(_.uniq(_.compact(studentsWithAbsences.map(student => student.counselor))));
  }

  // Heuristic: any day that has any absences is a school day, days with perfect
  // attendance are holidays/weekends.
  schoolDaysCount() {
    return this.memoize(['schoolDaysCount'], () => {
      const {studentsWithAbsences} = this.props;
      const schoolDaysMap = {};
      studentsWithAbsences.forEach(student => {
        student.absences.forEach(absence => {
          const dateText = moment.utc(absence.occurred_at).format('YYYYMMDD');
          schoolDaysMap[dateText] = true;
        });
      });
      return Object.keys(schoolDaysMap).length;
    });
  }

  // Compute attendance counts and rate for a set of students
  attendanceDataForStudents(students, endMoment) {
    const absencesCount = students.reduce((count, student) => {
      return this.filteredAbsences(student.absences, endMoment).length + count;
    }, 0);
    const studentsCount = students.length;
    const studentDays = this.schoolDaysCount() * studentsCount;
    const attendanceRate = (studentDays === 0)
      ? null
      : parseFloat((100 * (studentDays - absencesCount) / studentDays).toFixed(3));
    return {studentDays, studentsCount, absencesCount, attendanceRate};
  }

  // Compute attendance data by homeroom, applying filters (but not homeroom,
  // so we keep showing all homerooms).
  homeroomChartData(endMoment) {
    return this.memoize(['homeroomChartData', this.state, arguments], () => {

      // Ordered bars for the chart
      // Partition by homeroom and compute each group
      const filteredStudents = this.filteredStudents({includeAllHomerooms: true});
      const studentsByHomeroom = _.groupBy(filteredStudents, 'homeroom_label');
      const homeroomLabels = _.compact(Object.keys(studentsByHomeroom));
      const unsortedHomeroomSeries = homeroomLabels.map(homeroomLabel => {
        const students = studentsByHomeroom[homeroomLabel];
        const attendanceData = this.attendanceDataForStudents(students, endMoment);
        return {
          ...attendanceData,
          homeroomLabel,
          y: attendanceData.attendanceRate,
          color: (homeroomLabel === this.state.homeroomLabel) ? 'orange' : null
        };
      });
      const homeroomSeries = _.sortBy(unsortedHomeroomSeries, 'attendanceRate');

      return {homeroomLabels, homeroomSeries};
    });
  }

  studentTableRows(endMoment) {
    return this.memoize(['studentTableRows', this.state, arguments], () => {
      const filteredStudents = this.filteredStudents();
      return filteredStudents.map(student => {
        return {
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          grade: student.grade,
          latest_note: student.latest_note,
          event_count: this.filteredAbsences(student.absences, endMoment).length
        };
      });
    });
  }

  timeRangeText() {
    const {timeRangeKey} = this.state;
    return timeRangeText(timeRangeKey);
  }

  onTimeRangeKeyChanged(timeRangeKey) {
    this.setState({timeRangeKey});
  }

  onExcusedAbsencesChanged(excusedAbsencesKey) {
    this.setState({excusedAbsencesKey});
  }

  onGradeChanged(grade) {
    this.setState({grade});
  }

  onHouseChanged(house) {
    this.setState({house});
  }

  onCounselorChanged(counselor) {
    this.setState({counselor});
  }

  onResetFilters() {
    this.setState(initialState(this.props, this.context));
  }

  onClearHomeroomSelected() {
    this.setState({homeroomLabel: null});
  }

  onBarChartColumnClicked(highchartsEvent) {
    const {homeroomLabel} = highchartsEvent.point;
    this.setState({homeroomLabel});
  }

  render() {
    const {nowFn} = this.context;
    const {school} = this.props;
    const endMoment = nowFn().endOf('day');

    return (
      <EscapeListener
        className="SchoolAbsencesDashboard"
        style={styles.root}
        onEscape={this.onResetFilters}
      >
        <SectionHeading>Absences at {school.name}</SectionHeading>
        <div style={dashboardStyles.filterBar}>
          {this.renderFilterBar()}
        </div>
        <div style={dashboardStyles.columns}>
          <div style={dashboardStyles.rosterColumn}>
            {this.renderStudentAbsenceTable(endMoment)}
          </div>
          <div style={dashboardStyles.chartsColumn}>
            {this.renderOverallData(endMoment)}
            {this.renderHomeroomAbsenceChart(endMoment)}
          </div>
        </div>
      </EscapeListener>
    );
  }

  renderFilterBar() {
    const {districtKey} = this.context;
    const {school} = this.props;
    const {timeRangeKey, excusedAbsencesKey, grade, house, counselor} = this.state;
    return (
      <div style={styles.filterBarContainer}>
        {supportsExcusedAbsences(districtKey)
          ? <FilterBar>
              <SelectExcusedAbsences
                excusedAbsencesKey={excusedAbsencesKey}
                onChange={this.onExcusedAbsencesChanged} />
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
          : <div /> /* empty element for justify-content: space-between */
        }
        <FilterBar labelText="Time range">
          <SelectTimeRange
            timeRangeKey={timeRangeKey}
            onChange={this.onTimeRangeKeyChanged} />
        </FilterBar>
      </div>
    );
  }

  renderStudentAbsenceTable(endMoment) {
    const studentTableRows = this.studentTableRows(endMoment);

    return (
      <StudentsTable
        rows={studentTableRows}
        incidentType='Absences' />
    );
  }

  renderOverallData(endMoment) {
    return this.memoize(['renderOverallData', this.state, arguments], () => {
      const filteredStudents = this.filteredStudents();
      const attendanceData = this.attendanceDataForStudents(filteredStudents, endMoment);
      const dataPoint = {
        ...attendanceData,
        y: attendanceData.attendanceRate
      };
      return (
        <div style={{display: 'flex', flex: 4}}>
          <DashboardBarChart
            id="overall"
            categories={{categories: ['Overall']}}
            seriesData={[dataPoint]}
            series={{pointWidth: 60}}
            yAxisMin={80}
            yAxisMax={100}
            titleText={`Attendance rate`}
            measureText={'Percent'}
            tooltip={{
              formatter() { return createHighChartsTooltipString(this.point); }
            }}
          />
        </div>
      );
    });
  }

  renderHomeroomAbsenceChart(endMoment) {
    const {homeroomSeries, homeroomLabels} = this.homeroomChartData(endMoment);
    return (
      <EscapeListener
        style={{display: 'flex', flex: 5}}
        escapeOnUnhandledClick={true}
        onEscape={this.onClearHomeroomSelected}>
        <DashboardBarChart
          id={'string'}
          animation={false}
          categories={{categories: homeroomLabels}}
          seriesData={homeroomSeries}
          yAxisMin={80}
          yAxisMax={100}
          titleText={`Attendance by homeroom`}
          measureText={'Percent of all students, days'}
          tooltip={{
            formatter() {
              return createHighChartsTooltipString(this.point);
            },
            // Enforce above the bar, and don't spill out of the
            // container to the top or right.  The default positioner
            // gets in the way of seeing and clicking on bars.
            positioner(labelWidth, labelHeight, point) {
              const {width} = this.chart.clipBox;
              const x = point.plotX;
              const y = point.plotY - (labelHeight/2);
              return {
                x: Math.min(x, width - labelWidth/2 - 10),
                y: Math.max(y, 0)
              };
            }
          }}
          onColumnClick={this.onBarChartColumnClicked}
        />
      </EscapeListener>
    );
  }
}
SchoolAbsencesDashboard.contextTypes = {
  nowFn: PropTypes.func.isRequired,
  districtKey: PropTypes.string.isRequired
};
SchoolAbsencesDashboard.propTypes = {
  studentsWithAbsences: PropTypes.array.isRequired,
  school: PropTypes.shape({
    name: PropTypes.string.isRequired,
    local_id: PropTypes.string.isRequired,
    school_type: PropTypes.string.isRequired
  }).isRequired
};

const styles = {
  root: {
    flex: 1,
    width: '100%',
    paddingLeft: 10,
    paddingRight: 10,
    display: 'flex',
    flexDirection: 'column'
  },
  filterBarContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  narrowSelect: {
    width: '8em'
  }
};


function initialState(props, context) {
  const {districtKey} = context;
  const excusedAbsencesKey = supportsExcusedAbsences(districtKey)
    ? EXCLUDE_EXCUSED_ABSENCES
    : ALL_ABSENCES;

  return {
    excusedAbsencesKey,
    grade: ALL,
    house: ALL,
    counselor: ALL,
    timeRangeKey: TIME_RANGE_45_DAYS_AGO,
    homeroomLabel: null
  };
}


// Highcharts parses this string as a subset of HTML
// and re-renders it as SVG
function createHighChartsTooltipString(point) {
  const {attendanceRate, absencesCount, studentsCount, homeroomLabel} = point;
  const homeroomLabelString = (homeroomLabel)
    ? `<br /><div>Homeroom: ${homeroomLabel}</div>`
    : '';
  return (
    `<div>
      <div>Attendance rate: <b>${Math.round(attendanceRate)}%</b></div>
      <br />
      <div>Absences: <b>${absencesCount}</b></div>
      <br />
      <div>Students: <b>${studentsCount}</b></div>
      ${homeroomLabelString}
    </div>`
  );
}
