import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import {Table, Column, AutoSizer, SortDirection} from 'react-virtualized';
import 'react-select/dist/react-select.css';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import {rankedByLetterGrade} from '../helpers/SortHelpers';
import {prettyProgramOrPlacementText} from '../helpers/specialEducation';
import {toCsvTextFromTable} from '../helpers/toCsvFromTable';
import DownloadCsvLink from '../components/DownloadCsvLink';
import {
  firstMatch,
  EN_OR_ELL,
  MATH,
  HISTORY,
  SCIENCE,
  CREDIT_RECOVERY,
  ACADEMIC_SUPPORT,
  REDIRECT,
  STUDY_SKILLS
} from './Courses';


// Render a virtualized table, with information and triggers on the
// left columns and supports on the right.
export default class StudentLevelsTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sortBy: 'level',
      sortDirection: SortDirection.ASC,
    };

    this.onTableSort = this.onTableSort.bind(this);
    this.renderStudent = this.renderStudent.bind(this);
    this.renderLevel = this.renderLevel.bind(this);
    this.renderAbsenceRate = this.renderAbsenceRate.bind(this);
    this.renderDisciplineIncidents = this.renderDisciplineIncidents.bind(this);
    this.renderProgram = this.renderProgram.bind(this);
  }

  // This is used both for react-virtualized and interpreted to make the CSV export.
  columns() {
    const gradeCellWidth = 50;
    const numericCellWidth = 70;
    const supportCellWidth = 70;

    return [{
      dataKey: 'student',
      label: <span><br />Student</span>,
      width: 120,
      flexGrow:1,
      cellRenderer: this.renderStudent
    }, {
      dataKey: 'level',
      label: <span><br />Level</span>,
      width: gradeCellWidth,
      cellRenderer: this.renderLevel
    }, {
      dataKey: 'absence',
      label: <span>Attendance<br/>Rate</span>,
      width: numericCellWidth,
      cellRenderer: this.renderAbsenceRate
    }, {
      dataKey: 'discipline',
      label: <span>Discipline<br/>Incidents</span>,
      width: numericCellWidth,
      cellRenderer: this.renderDisciplineIncidents
    }, {
      dataKey: 'en_or_ell',
      label: <span><br />EN/ELL</span>,
      width: gradeCellWidth,
      cellRenderer: this.renderGradeFor.bind(this, EN_OR_ELL)
    }, {
      dataKey: 'history',
      label: <span>Social<br/>Studies</span>,
      width: gradeCellWidth,
      cellRenderer: this.renderGradeFor.bind(this, HISTORY)
    }, {
      dataKey: 'math',
      label: <span><br />Math</span>,
      width: gradeCellWidth,
      cellRenderer: this.renderGradeFor.bind(this, MATH)
    }, {
      dataKey: 'science',
      label: <span><br />Science</span>,
      width: gradeCellWidth,
      cellRenderer: this.renderGradeFor.bind(this, SCIENCE)
    }, {
      dataKey: 'nge',
      label: <span>Last NGE/<br/>10GE/NEST</span>,
      width: supportCellWidth,
      cellRenderer: this.renderNotes.bind(this, 'last_experience_note')
    }, {
      dataKey: 'sst',
      label: <span>Last SST</span>,
      width: supportCellWidth,
      cellRenderer: this.renderNotes.bind(this, 'last_sst_note')
    }, {
      dataKey: 'study',
      label: <span>Study<br/>skills</span>,
      width: supportCellWidth,
      cellRenderer: this.renderIf.bind(this, STUDY_SKILLS, 'study')
    }, {
      dataKey: 'support',
      label: <span>Academic<br/>Support</span>,
      width: supportCellWidth,
      cellRenderer: this.renderIf.bind(this, ACADEMIC_SUPPORT, 'support')
    }, {
      dataKey: 'redirect',
      label: <span><br/>Redirect</span>,
      width: supportCellWidth,
      cellRenderer: this.renderIf.bind(this, REDIRECT, 'redirect')
    }, {
      dataKey: 'recovery',
      label: <span>Credit<br/>Recovery</span>,
      width: supportCellWidth,
      cellRenderer: this.renderIf.bind(this, CREDIT_RECOVERY, 'recovery')
    }, {
      dataKey: 'program_assigned',
      label: <span>Program<br/>or SPED</span>,
      width: supportCellWidth,
      cellRenderer: this.renderProgram
    }];
  }

  orderedStudents() {
    const {studentsWithTiering} = this.props;
    const {sortBy, sortDirection} = this.state;

    // map dataKey to an accessor/sort function
    const sortFns = {
      student(student) { return `${student.last_name}, ${student.first_name}`; },
      level(student) { return student.tier.level; },
      absence(student) { return student.tier.data.recent_absence_rate; },
      discipline(student) { return student.tier.data.recent_discipline_actions; },
      en_or_ell(student) { return sortByGrade(EN_OR_ELL, student); },
      history(student) { return sortByGrade(HISTORY, student); },
      math(student) { return sortByGrade(MATH, student); },
      science(student) { return sortByGrade(SCIENCE, student); },
      nge(student) { return sortTimestamp(student.notes.last_experience_note.recorded_at); },
      sst(student) { return sortTimestamp(student.notes.last_sst_note.recorded_at); },
      study(student) { return sortIfCourse(STUDY_SKILLS, student); },
      support(student) { return sortIfCourse(ACADEMIC_SUPPORT, student); },
      redirect(student) { return sortIfCourse(REDIRECT, student); },
      recovery(student) { return sortIfCourse(CREDIT_RECOVERY, student); },
      program_assigned(student) { return prettyProgramOrPlacementText(student); },
      fallback(student) { return student[sortBy]; }
    };

    // "Natural" sort order, before table sorting
    const sortFn = sortFns[sortBy] || sortFns.fallback;
    const sortedRows = _.sortBy(studentsWithTiering, [
      (s => sortFn(s)),
      (s => s.tier.level),
      (s => s.tier.triggers.length),
      (s => s.tier.triggers.sort()),
      (s => s.last_name),
      (s => s.first_name)
    ]);
    // sort and respect direction
    
    // const sortedRows = _.sortBy(studentsWithTiering, sortFn);
    return (sortDirection === SortDirection.DESC) 
      ? sortedRows.reverse()
      : sortedRows;
  }

  onTableSort({defaultSortDirection, event, sortBy, sortDirection}) {
    if (sortBy === this.state.sortBy) {
      const oppositeSortDirection = (this.state.sortDirection == SortDirection.DESC)
        ? SortDirection.ASC
        : SortDirection.DESC;
      this.setState({ sortDirection: oppositeSortDirection });
    } else {
      this.setState({sortBy});
    }

    this.tableEl.scrollToRow(0);
  }

  render() {
    const {sortDirection, sortBy} = this.state;
    const students = this.orderedStudents();
    return (
      <div className="StudentLevelsTable" style={{flex: 1, display: 'block', flexDirection: 'column'}}>
        {this.renderDownloadLink()}
        <AutoSizer>
          {({height, width}) => (
            <Table
              ref={el => this.tableEl = el}
              width={width}
              headerHeight={40}
              height={height}
              rowCount={students.length}
              rowGetter={({index}) => students[index]}
              rowHeight={40}
              rowStyle={{display: 'flex', alignItems: 'center'}}
              headerStyle={styles.tableHeaderStyle}
              sort={this.onTableSort}
              sortBy={sortBy}
              sortDirection={sortDirection}
            >{this.columns().map(column => <Column key={column.dataKey} {...column} />)}
            </Table>
          )}
        </AutoSizer>
      </div>
    );
  }

  renderDownloadLink() {
    const columns = this.columns();
    const students = this.orderedStudents();
    const csvText = toCsvTextFromTable(columns, students);
    const {nowFn} = this.context;
    const now = nowFn();
    const filename = `SHSLevelsPrototype-${now.format('YYYY-MM-DD')}.csv`;
    return (
      <DownloadCsvLink style={styles.downloadLink} disableButtonClass={true} filename={filename} csvText={csvText}>
        <svg style={{fill: "#3177c9", opacity: 0.5}} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
      </DownloadCsvLink>
    );
  }

  renderStudent({rowData}) {
    const student = rowData;
    return <a style={styles.person} target="_blank" href={`/students/${student.id}`}>{student.first_name} {student.last_name}</a>;
  }

  renderLevel({rowData}) {
    return <span style={{textAlign: 'center'}}>{rowData.tier.level}</span>;
  }

  renderDisciplineIncidents({rowData}) {
    const {tier} = rowData;
    const count = tier.data.recent_discipline_actions;
    const style = (tier.triggers.indexOf('discipline') !== -1)
      ? styles.warn
      : styles.plain;
    return <span style={style}>{count}</span>; 
  }

  renderAbsenceRate({rowData}) {
    const {tier} = rowData;
    const percentage = Math.round(tier.data.recent_absence_rate * 100);
    const style = (tier.triggers.indexOf('absence') !== -1)
      ? styles.warn
      : styles.plain;
    return <span style={style}>{percentage}%</span>; 
  }

  renderGradeFor(patterns, {rowData}) {
    const student = rowData;
    const assignment = firstMatch(student.student_section_assignments_right_now, patterns);
    return (assignment)
      ? this.renderGrade(assignment.grade_letter)
      : null;
  }

  renderIf(patterns, el, {rowData}) {
    const student = rowData;
    const assignment = firstMatch(student.student_section_assignments_right_now, patterns);
    return (assignment)
      ? <span style={styles.support}>{el}</span>
      : null;
  }

  renderTriggerIf(trigger, {rowData}) {
    return (rowData.tier.triggers.indexOf(trigger) !== -1)
      ? trigger
      : null;
  }

  renderProgram({rowData}) {
    const student = rowData;
    const programText = prettyProgramOrPlacementText(student);

    return (programText !== null)
      ? <span style={{...styles.support, fontSize: 12}}>{programText}</span>
      : null;
  }

  renderGrade(gradeLetter) {
    if (!gradeLetter) return null;

    if (gradeLetter.indexOf('F') !== -1) {
      return <span style={{...styles.grade, backgroundColor: warningColor}}>{gradeLetter}</span>;
    } else if (gradeLetter.indexOf('D') !== -1) {
      return <span style={{...styles.grade, backgroundColor: warningColor}}>{gradeLetter}</span>;
    } else if (gradeLetter.indexOf('B') !== -1) {
      return <span style={{...styles.grade, backgroundColor: strengthColor, color: 'white'}}>{gradeLetter}</span>;
    } else if (gradeLetter.indexOf('A') !== -1) {
      return <span style={{...styles.grade, backgroundColor: strengthColor, color: 'white'}}>{gradeLetter}</span>;
    }
    return <span style={styles.grade}>{gradeLetter}</span>;
  }

  renderNotes(key, {rowData}) {
    const {nowFn} = this.context;
    const now = nowFn();
    const eventNote = rowData.notes[key];
    if (eventNote === undefined) return null;
    if (eventNote.recorded_at === undefined) return null;

    const noteMoment = toMomentFromTimestamp(eventNote.recorded_at);
    const daysAgo = now.clone().diff(noteMoment, 'days');
    if (daysAgo > 45) return null;
    const daysAgoText = (daysAgo === 0)
      ? 'today'
      : (daysAgo === 1) ? 'yesterday' : `${daysAgo} days`;
    return <span style={{...styles.support, fontSize: 12}}>{daysAgoText}</span>;
  }
}
StudentLevelsTable.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
StudentLevelsTable.propTypes = {
  studentsWithTiering: PropTypes.array.isRequired
};

const warningColor = 'rgb(255, 222, 198)';
const strengthColor = '#4d884d';
const styles = {
  tableHeaderStyle: {
    display: 'flex',
    fontSize: 12,
    fontWeight: 'normal',
    alignContent: 'flex-start',
    borderBottom: '1px solid #aaa',
    paddingBottom: 3,
    height: '100%'
  },
  grade: {
    display: 'inline-block',
    width: 35,
    textAlign: 'center',
    padding: 8
  },
  person: {
    fontWeight: 'bold',
    fontSize: 14
  },
  support: {
    display: 'inline-block',
    textAlign: 'center',
    padding: 4,
    backgroundColor: '#3177c9',
    color: 'white',
    fontSize: 12,
    width: '95%',
    height: '95%'
  },
  warn: {
    display: 'inline-block',
    backgroundColor: warningColor,
    padding: 8
  },
  plain: {
    display: 'inline-block',
    padding: 8
  },
  downloadLink: {
    color: 'white',
    position: 'absolute',
    right: 10,
    top: -60 // workaround to appear in bar above
  }
};

function sortByGrade(patterns, student) {
  const assignment = firstMatch(student.student_section_assignments_right_now, patterns);
  return (assignment && assignment.grade_letter)
    ? rankedByLetterGrade(assignment.grade_letter)
    : Number.POSITIVE_INFINITY;
}

function sortIfCourse(patterns, student) {
  const assignment = firstMatch(student.student_section_assignments_right_now, patterns);
  return (assignment) ? 1 : 0;
}

function sortTimestamp(maybeString) {
  return (maybeString)
    ? moment.utc(maybeString).unix()
    : Number.NEGATIVE_INFINITY;
}
