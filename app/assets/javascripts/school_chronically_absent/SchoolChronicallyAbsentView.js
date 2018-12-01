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
  TIME_RANGE_45_DAYS_AGO,
  TIME_RANGE_SCHOOL_YEAR
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

  filteredAbsences(absences, endMoment, options = {}) {
    const timeRangeKey = options.forceTimeRangeKey || this.state.timeRangeKey;
    const range = momentRange(timeRangeKey, endMoment);
    return absences.filter(absence => {
      if (!moment.utc(absence.occurred_at).isBetween(range[0], range[1])) return false;
      if (!options.alwaysIncludeExcused && !this.shouldIncludeExcusedAbsences() && absence.excused) return false;
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

  // Don't apply any filters to students
  schoolDaysCountDuringRange(range) {
    const {studentsWithAbsences} = this.props;
    return this.memoize(['schoolDaysCount', arguments], () => {
      return schoolDaysCountDuringRange(studentsWithAbsences, range);
    });
  }

  // Compute attendance counts and rate for a set of students
  attendanceDataForStudents(students, endMoment) {
    // all duplicate now!
    // Linear run through all absences (n absences)
    const struct = {};
    students.forEach(student => {
      student.absences.forEach(absence => {
        const dateText = moment.utc(absence.occurred_at).format('YYYYMMDD');
        if (!struct[absence.student_id]) struct[absence.student_id] = {};
        if (!struct[absence.student_id][dateText]) struct[absence.student_id][dateText] = 0;
        struct[absence.student_id][dateText] += 1;
      });
    });

    const range = momentRange(TIME_RANGE_SCHOOL_YEAR, endMoment);
    const schoolDaysInWindow = this.schoolDaysCountDuringRange([range[0], endMoment]);
    const slice = mapDates(range, dateMoment => dateMoment.format('YYYYMMDD'));

    const debug = [];
    students.forEach(student => {
      var absencesCount = 0; // eslint-disable-line no-var
      slice.forEach(dateText => {
        if (!struct[student.id]) return;
        if (!struct[student.id][dateText]) return;
        absencesCount += struct[student.id][dateText];
      });
      const absenceRate = (schoolDaysInWindow - absencesCount) / schoolDaysInWindow;
      const caPercentage = Math.round(100 * (1 - absenceRate));
      debug.push({student, caPercentage, absencesCount});
    });
    console.log('debug', debug);
    const chronicallyAbsentStudentsCount = debug.filter(({caPercentage}) => caPercentage >= 10).length;

    return {
      chronicallyAbsentStudentsCount,
      schoolDaysInWindow,
      allStudentsCount: students.length
    };


    /*
    const absencesCount = students.reduce((count, student) => {
      return this.filteredAbsences(student.absences, endMoment).length + count;
    }, 0);
    const studentsCount = students.length;
    const studentDays = this.schoolDaysCount() * studentsCount;
    const attendanceRate = (studentDays === 0)
      ? null
      : parseFloat((100 * (studentDays - absencesCount) / studentDays).toFixed(3));
    return {studentDays, studentsCount, absencesCount, attendanceRate};
    */
  }

  // No windowing
  chronicallyAbsentCountOverTime(filteredStudents, range, homeroomLabel) {
    // console.log('range:', range[0].format('YYYYMMDD'), range[1].format('YYYYMMDD'));

    // Linear run through all absences (n absences)
    const struct = {};
    filteredStudents.forEach(student => {
      student.absences.forEach(absence => {
        const dateText = moment.utc(absence.occurred_at).format('YYYYMMDD');
        if (!struct[absence.student_id]) struct[absence.student_id] = {};
        if (!struct[absence.student_id][dateText]) struct[absence.student_id][dateText] = 0;
        struct[absence.student_id][dateText] += 1;
      });
    });
    const allDateMoments = mapDates(range, dateMoment => dateMoment);

    // Now need to run (n students) * (m days window) * ()
    const allStudentsCount = filteredStudents.length;
    return allDateMoments.map(endWindowMoment => {
      // school days in slice, so we can convert to attendance rate later
      const startWindowMoment = range[0];
      const schoolDaysInWindow = this.schoolDaysCountDuringRange([startWindowMoment, endWindowMoment]);
      // console.log(startWindowMoment.format('YYYYMMDD') + ' - ' + endWindowMoment.format('YYYYMMDD'), 'schoolDaysInWindow:', schoolDaysInWindow);

      // make a slice of dateTexts
      const slice = allDateMoments.filter(dateMoment => {
        return dateMoment.isBefore(endWindowMoment);
      }).map(dateMoment => dateMoment.format('YYYYMMDD'));

      // console.log('window:', _.first(slice), _.last(slice));      

      // in this slice, compute absent count for each student
      const debug = [];
      filteredStudents.forEach(student => {
        var absencesCount = 0; // eslint-disable-line no-var
        slice.forEach(dateText => {
          if (!struct[student.id]) return;
          if (!struct[student.id][dateText]) return;
          absencesCount += struct[student.id][dateText];
        });
        const absenceRate = (schoolDaysInWindow - absencesCount) / schoolDaysInWindow;
        const caPercentage = Math.round(100 * (1 - absenceRate));
        debug.push({student, caPercentage, absencesCount});
      });

      // console.log('absenceCounts', _.uniq(absenceCounts).sort());
      // const cc = debug.filter(d => d.absencesCount >= (schoolDaysInWindow*0.10)).length;
      // console.log('debug:', slice.length, schoolDaysInWindow, endWindowMoment.format('YYYYMMDD'), schoolDaysInWindow*0.10, cc, debug);



      // how many student are chronically absent during that window?
      // const attendanceRates = absenceCounts.map(absenceCount => {
      //   return (schoolDaysInWindow - absenceCount) / schoolDaysInWindow;
      // });

      // console.log('attendanceRates:', schoolDaysInWindow, endWindowMoment.format('YYYYMMDD'), attendanceRates.sort());
      // const chronicallyAbsentStudentsCount = attendanceRates.filter(rate => Math.round(100 * rate) < 90).length;
      // console.log('ca', slice.length, schoolDaysInWindow, '/', endWindowMoment.format('YYYYMMDD'), chronicallyAbsentStudentsCount, attendanceRates.sort().reverse());
      // console.log('ca', endWindowMoment.format('YYYYMMDD'), chronicallyAbsentStudentsCount);

      //debug
      // const chronicallyAbsentStudentNames = debug.filter(({student, absencesCount}) => {
      //   return Math.round(100 * ((schoolDaysInWindow - absencesCount) / schoolDaysInWindow)) > 90;
      // }).map(({student}) => student.first_name);
      // console.log('endWindowMoment', endWindowMoment.format('YYYYMMDD'), debug.filter(({caPercentage}) => caPercentage >= 10));
      const chronicallyAbsentStudentsCount = debug.filter(({caPercentage}) => caPercentage >= 10).length;

      // what percent is that of all the kids?
      // TODO(kr) doesn't handle enrollment changes over time
      const chronicallyAbsentPercentage = Math.round(100 * chronicallyAbsentStudentsCount / allStudentsCount);
      return {
        startWindowMoment,
        endWindowMoment,
        chronicallyAbsentStudentsCount,
        chronicallyAbsentPercentage,
        nDaysWindow: endWindowMoment.clone().diff(startWindowMoment, 'days'),
        schoolDaysInWindow,
        homeroomLabel,
        allStudentsCount,
        y: chronicallyAbsentStudentsCount == 0 ? null : chronicallyAbsentStudentsCount
      };
    });
  }


  // for rolling window
  chronicallyAbsentCountOn(students, timeRangeKey, endMoment, homeroomLabel) {
    return this.memoize(['chronicallyAbsentCountOn', this.state, arguments], () => {
      // console.log('chronicallyAbsentCountOn', endMoment.format('YYYYMMDD'));
      const timeRange = momentRange(TIME_RANGE_45_DAYS_AGO, endMoment);
      const allStudentsCount = students.length;

      const dataPoints = mapDates(timeRange, dateMoment => {
        // compute data point, using 45 day window from here!
        const windowRange = momentRange(timeRangeKey, dateMoment);
        const schoolDaysInWindow = this.schoolDaysCountDuringRange(windowRange);
        const chronicallyAbsentStudentsCount = students.filter(student => {
          return this.isChronicallyAbsentDuringWindow(student, timeRangeKey, dateMoment, schoolDaysInWindow);
        }).length;

        // // TODO(kr) doesn't handle enrollment changes over time
        const chronicallyAbsentPercentage = Math.round(100 * chronicallyAbsentStudentsCount / allStudentsCount);

        // data point for chart
        return {
          chronicallyAbsentPercentage,
          chronicallyAbsentStudentsCount,
          allStudentsCount,
          homeroomLabel,
          dateMoment,
          y: chronicallyAbsentPercentage
        };
      });

      return _.sortBy(dataPoints, d => d.dateMoment.format('YYYYMMDD'));
    });
  }

  // for rolling window
  isChronicallyAbsentDuringWindow(student, timeRangeKey, endMoment, schoolDaysCount) {
    return this.memoize(['isChronicallyAbsentDuringWindow', this.state, arguments], () => {
      const absencesCount = this.filteredAbsences(student.absences, endMoment, {
        alwaysIncludeExcused: true,
        forceTimeRangeKey: timeRangeKey
      }).length; 
      const attendanceRate = (schoolDaysCount - absencesCount) / schoolDaysCount;
      return (Math.round(attendanceRate) < 90);
    });
  }

  // Compute attendance data by homeroom, applying filters (but not homeroom,
  // so we keep showing all homerooms).
  homeroomChartData(endMoment) {
    return this.memoize(['homeroomChartData', this.state, arguments], () => {

      // Ordered bars for the chart
      // Partition by homeroom and compute each group
      const filteredStudents = this.filteredStudents({includeAllHomerooms: true});
      const studentsByHomeroom = _.groupBy(filteredStudents, 'homeroom_label');
      const unsortedHomeroomLabels = _.compact(Object.keys(studentsByHomeroom));
      const unsortedHomeroomSeries = unsortedHomeroomLabels.map(homeroomLabel => {
        const students = studentsByHomeroom[homeroomLabel];
        const attendanceData = this.attendanceDataForStudents(students, endMoment);
        return {
          ...attendanceData,
          homeroomLabel,
          y: attendanceData.chronicallyAbsentStudentsCount,
          color: (homeroomLabel === this.state.homeroomLabel) ? 'orange' : null
        };
      });
      const homeroomSeries = _.sortBy(unsortedHomeroomSeries, 'chronicallyAbsentStudentsCount').reverse();
      const homeroomLabels = homeroomSeries.map(dataPoint => dataPoint.homeroomLabel);

      return {homeroomLabels, homeroomSeries};
    });
  }

  studentTableRows(endMoment) {
    return this.memoize(['studentTableRows', this.state, arguments], () => {
      // filters
      const filteredStudents = this.filteredStudents();

      // school days for overall and recent
      const recentSchoolDaysCount = this.schoolDaysCountDuringRange(momentRange(TIME_RANGE_45_DAYS_AGO, endMoment));
      const schoolDaysCount = this.schoolDaysCount();
      // console.log('schoolDaysCount', schoolDaysCount);

      // loop
      return filteredStudents.map(student => {
        // count with filters for time period
        const eventCount = this.filteredAbsences(student.absences, endMoment).length;
        
        // core, yearly, not looking at filter
        const eventCountForChronicallyAbsentSchoolYear = this.filteredAbsences(student.absences, endMoment, {
          alwaysIncludeExcused: true,
          forceTimeRangeKey: TIME_RANGE_SCHOOL_YEAR
        }).length;

        // run
        const {nowFn} = this.context; // breaks memoizing
        const nowMoment = nowFn();
        const lastAbsence = student.absences.length > 0
          ? moment.utc(_.last(student.absences).occurred_at)
          : null;
        const daysAgo = lastAbsence ?  nowMoment.diff(lastAbsence, 'days') : null;
        const schoolDaysRun = lastAbsence
          ? this.schoolDaysCountDuringRange([lastAbsence, endMoment])
          : null;

        // recovery
        const recoveryRun = (10 * eventCountForChronicallyAbsentSchoolYear) - schoolDaysCount;

        // recent
        const recentChronicallyAbsentCount = this.filteredAbsences(student.absences, endMoment, {
          alwaysIncludeExcused: true,
          forceTimeRangeKey: TIME_RANGE_45_DAYS_AGO
        }).length;
        const recentChronicallyAbsentPercentage = recentSchoolDaysCount > 0
          ? (recentSchoolDaysCount - recentChronicallyAbsentCount) / recentSchoolDaysCount
          : null;

        // since last note
        const latestNoteMoment = student.latest_note
          ? moment.utc(student.latest_note.recorded_at)
          : null;
        const absencesSinceLastNote = (latestNoteMoment === null)
          ? student.absences
          : student.absences.filter(absence => {
            return moment.utc(absence.occurred_at).isAfter(latestNoteMoment);
          });

        // const schoolDaysSinceLastNote = latestNoteMoment
        //   ? this.schoolDaysCountDuringRange([latestNoteMoment, endMoment])
        //   : null;
        const chronicallyAbsentCountSinceLastNote = this.filteredAbsences(absencesSinceLastNote, endMoment, {
          alwaysIncludeExcused: true,
          forceTimeRangeKey: TIME_RANGE_SCHOOL_YEAR
        }).length;
        // const chronicallyAbsentSinceLastNote = schoolDaysSinceLastNote > 0
        //   ? (schoolDaysSinceLastNote - chronicallyAbsentCountSinceLastNote) / schoolDaysSinceLastNote
        //   : null;

        return {
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          grade: student.grade,
          latest_note: student.latest_note,
          event_count: eventCount,
          // new!
          // school_days_count: this.schoolDaysCount(),
          // sc: student.absences_count,
          // sca: Math.round(student.rate * 100) + '%',

          since_note: chronicallyAbsentCountSinceLastNote,
          recent_ca: (1-recentChronicallyAbsentPercentage),
          school_days_run: schoolDaysRun,
          days_ago: daysAgo,
          total: eventCountForChronicallyAbsentSchoolYear,
          ca_attendance: (1 -(schoolDaysCount - eventCountForChronicallyAbsentSchoolYear) / schoolDaysCount),
          recover: recoveryRun > 0 ? Math.ceil(recoveryRun) : null,
          school_days_count: schoolDaysCount
          // ca: (schoolDaysCount - eventCountForChronicallyAbsentPeriod) / schoolDaysCount,
          // ma: (schoolDaysCount - eventCountForChronicallyAbsentSchoolYear) / schoolDaysCount
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
    const {school, chronicallyAbsentUrl} = this.props;
    const endMoment = nowFn().endOf('day');

    return (
      <EscapeListener
        className="SchoolAbsencesDashboard"
        style={styles.root}
        onEscape={this.onResetFilters}
      >
        <SectionHeading titleStyle={styles.title}>
            <div>Chronically absent at {school.name}</div>
            <div style={styles.headerLinkContainer}>
              <a style={styles.headerLink} href={chronicallyAbsentUrl} target="_blank" rel="noopener noreferrer">Root Causes for Students Missing School</a>
            </div>
          </SectionHeading>
        <div style={dashboardStyles.filterBar}>
          {this.renderFilterBar()}
        </div>
        <div style={dashboardStyles.columns}>
          <div style={{...dashboardStyles.rosterColumn, width: 500}}>
            {this.renderStudentAbsenceTable(endMoment)}
          </div>
          <div style={dashboardStyles.chartsColumn}>
            {this.renderChronicCountOverTime(endMoment)}
            {this.renderHomeroomAbsenceChart(endMoment)}
          </div>
        </div>
      </EscapeListener>
    );
  }

  renderFilterBar() {
    const {districtKey} = this.context;
    const {school} = this.props;
    const {excusedAbsencesKey, grade, house, counselor} = this.state;
    return (
      <div style={styles.filterBarContainer}>
        <FilterBar>
          {/*supportsExcusedAbsences(districtKey) && (
            <SelectExcusedAbsences
              excusedAbsencesKey={excusedAbsencesKey}
              onChange={this.onExcusedAbsencesChanged} />
          )*/}
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
        {/*<FilterBar labelText="Time range">
          <SelectTimeRange
            timeRangeKey={timeRangeKey}
            onChange={this.onTimeRangeKeyChanged} />
        </FilterBar>*/}
      </div>
    );
  }

  renderStudentAbsenceTable(endMoment) {
    const studentTableRows = this.studentTableRows(endMoment);

    return (
      <StudentsTable
        rows={studentTableRows}
        incidentType='Recent' />
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

  // Always school year
  renderChronicCountOverTime(endMoment) {
    return this.memoize(['renderChronicWindowOverTime', this.state, arguments], () => {
      // console.log('renderChronicWindowOverTime');
      const {homeroomLabel} = this.state;
      const filteredStudents = this.filteredStudents();

      const range = momentRange(TIME_RANGE_SCHOOL_YEAR, endMoment);
      const dataPoints = this.chronicallyAbsentCountOverTime(filteredStudents, range, homeroomLabel);
      const latestPercentage = _.last(dataPoints).chronicallyAbsentPercentage;
      // console.log('dataPoints', dataPoints);
      return (
        <div style={{display: 'flex', flex: 4}}>
          <DashboardBarChart
            id="over-time"
            type="line"
            categories={{categories: dataPoints.map(d => d.endWindowMoment.format('M/D'))}}
            seriesData={dataPoints}
            yAxisMin={0}
            titleText={`Chronically absent, ${Math.round(latestPercentage)}% of students`}
            measureText={'Number of Students'}
            tooltip={{
              formatter() { return createChronicallyAbsentTooltipString(this.point); }
            }}
          />
        </div>
      );
    });
  }

  renderChronicWindowOverTime(endMoment) {
    return this.memoize(['renderChronicWindowOverTime', this.state, arguments], () => {
      // console.log('renderChronicWindowOverTime');
      const {homeroomLabel} = this.state;
      const filteredStudents = this.filteredStudents();

      // Using 45 calendar days isn't good, because it can be 29/30 school days depending on the 
      // calendar.  And at small numbers, 10% of 29/30 days means the difference in whether
      // students with 2 or 3 absences are included.
      //
      // Better instead to fix to school days, to make sure this is consistent.
      // const nDaysWindow = 60;
      //
      // Here fix school days
      // const nSchoolDays = 30;
      // const sortedDateTexts = _.flatMap(filteredStudents, student => {
      //   return student.absences.map(absence => {
      //     return moment.utc(absence.occurred_at).format('YYYYMMDD');
      //   });
      // }).sort();
      // const windowDateTexts = sortedDateTexts.slice(-1 * nSchoolDays);
      const nDaysWindow = 55;
      const dataPoints = this.chronicallyAbsentCountOnSPLAT(filteredStudents, endMoment, nDaysWindow, homeroomLabel);
      // console.log('dataPoints', dataPoints);
      return (
        <div style={{display: 'flex', flex: 4}}>
          <DashboardBarChart
            id="overall"
            categories={{categories: ['Overall']}}
            seriesData={dataPoints}
            yAxisMin={0}
            yAxisMax={20}
            titleText={`Chronically absent, rolling ${nDaysWindow}-day`}
            measureText={'Percent of students'}
            tooltip={{
              formatter() { return createChronicallyAbsentTooltipString(this.point); }
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
          categories={{
            categories: homeroomLabels,
            // tickPositions: [0, 2, 4, 6, 8, 10]
          }}
          seriesData={homeroomSeries}
          yAxisMin={0}
          yAxisMax={10}
          titleText={`Chronically absent by homeroom`}
          measureText={'Number of students'}
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
  chronicallyAbsentUrl: PropTypes.string.isRequired,
  studentsWithAbsences: PropTypes.array.isRequired,
  inferredSchoolDates: PropTypes.arrayOf(PropTypes.string).isRequired,
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
  },
  title: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLinkContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  headerLink: {
    fontSize: 14
  }
};


function initialState(props, context) {
  const {districtKey} = context;
  const excusedAbsencesKey = ALL_ABSENCES;
  // const excusedAbsencesKey = supportsExcusedAbsences(districtKey)
  //   ? EXCLUDE_EXCUSED_ABSENCES
  //   : ALL_ABSENCES;

  return {
    excusedAbsencesKey,
    grade: ALL,
    house: ALL,
    counselor: ALL,
    timeRangeKey: TIME_RANGE_SCHOOL_YEAR,
    homeroomLabel: null
  };
}


// Highcharts parses this string as a subset of HTML
// and re-renders it as SVG
function createHighChartsTooltipString(point) {
  const {schoolDaysInWindow, chronicallyAbsentStudentsCount, allStudentsCount, homeroomLabel} = point;
  const homeroomLabelString = (homeroomLabel)
    ? `<br /><div>Homeroom: ${homeroomLabel}</div>`
    : '';
  return (
    `<div>
      <div>Number of students: <b>${chronicallyAbsentStudentsCount}</b></div>
      <br />
      <div>Chronically absent: <b>${Math.round(100 * chronicallyAbsentStudentsCount / allStudentsCount)}% of ${allStudentsCount} students</b></div>
      <br />
      ${homeroomLabelString}
    </div>`
  );
}


// Highcharts parses this string as a subset of HTML
// and re-renders it as SVG
function createChronicallyAbsentTooltipString(point) {
  const {
    allStudentsCount,
    schoolDaysInWindow,
    startWindowMoment,
    endWindowMoment,
    chronicallyAbsentPercentage,
    chronicallyAbsentStudentsCount,
    homeroomLabel
  } = point;
  const homeroomLabelString = (homeroomLabel)
    ? `<br /><div>Homeroom: ${homeroomLabel}</div>`
    : '';
  return (
    `<div>
      <div>Number of students: <b>${chronicallyAbsentStudentsCount}</b></div>
      <br />
      <div>Chronically absent: <b>${Math.round(chronicallyAbsentPercentage)}% of ${allStudentsCount} students</b></div>
      <br />
      <div>School days: ${schoolDaysInWindow}</div>
      <br />
      <div>During: <b>${startWindowMoment.format('M/D')} - ${endWindowMoment.format('M/D')}</b></div>
      <br />
      ${homeroomLabelString}
    </div>`
  );
}


function schoolDaysCountDuringRange(students, range) {
  const startMomentText = range[0].format('YYYYMMDD');
  const endMomentText = range[1].format('YYYYMMDD');
  const schoolDaysMap = {};
  students.forEach(student => {
    student.absences.forEach(absence => {
      const dateText = moment.utc(absence.occurred_at).format('YYYYMMDD');
      if (parseInt(dateText, 10) < parseInt(startMomentText, 10)) return;
      if (parseInt(dateText, 10) > parseInt(endMomentText, 10)) return;
      schoolDaysMap[dateText] = true;
    });
  });
  return Object.keys(schoolDaysMap).length;
}


function mapDates(range, fn) {
  const mappedDates = [];

  var currentMoment = range[0].clone(); // eslint-disable-line no-var
  while (currentMoment.unix() < range[1].unix()) {
    mappedDates.push(fn(currentMoment));
    currentMoment = currentMoment.clone().add(1, 'day');
  }

  return mappedDates;
}