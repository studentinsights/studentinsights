import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import {Table, Column, AutoSizer, SortDirection, SortIndicator} from 'react-virtualized';
import 'react-select/dist/react-select.css';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import {rankedByLetterGrade} from '../helpers/SortHelpers';
import {prettyProgramOrPlacementText} from '../helpers/specialEducation';
import {
  firstMatch,
  firstMatchWithGrades,
  ENGLISH_OR_CORE_ELL,
  MATH,
  SOCIAL_STUDIES,
  SCIENCE,
  CREDIT_RECOVERY,
  ACADEMIC_SUPPORT,
  REDIRECT,
  STUDY_SKILLS
} from './Courses';


// Render a virtualized table, with information and triggers on the
// left columns and supports on the right.  Exports the description
// of the column and the ordering functions for re-use in exporting
// this data as a CSV.
export default class StudentLevelsTable extends React.Component {
  constructor(props) {
    super(props);

    this.renderHeaderCell = this.renderHeaderCell.bind(this);
    this.onTableSort = this.onTableSort.bind(this);
  }

  onTableSort({defaultSortDirection, event, sortBy, sortDirection}) {
    const {onTableSort} = this.props;
    onTableSort({sortBy, sortDirection});
    this.tableEl.scrollToRow(0);
  }

  render() {
    const {nowFn} = this.context;
    const nowMoment = nowFn();
    const {orderedStudentsWithLevels, sortBy, sortDirection} = this.props;
    const columns = describeColumns(nowMoment);
    const rowHeight = 40;

    return (
      <div className="StudentLevelsTable" style={styles.root}>
        <AutoSizer>
          {({height, width}) => (
            <Table
              ref={el => this.tableEl = el}
              width={width || 1024} /* for test, since sizing doesn't work in jsdom */
              height={height || 768} /* for test, since sizing doesn't work in jsdom */
              headerHeight={rowHeight}
              headerStyle={styles.tableHeaderStyle}
              rowCount={orderedStudentsWithLevels.length}
              rowGetter={({index}) => orderedStudentsWithLevels[index]}
              rowHeight={rowHeight}
              rowStyle={{display: 'flex', alignItems: 'center'}}
              sort={this.onTableSort}
              sortBy={sortBy}
              sortDirection={sortDirection}
            >{columns.map(column => <Column key={column.dataKey} headerRenderer={this.renderHeaderCell} {...column} />)}
            </Table>
          )}
        </AutoSizer>
      </div>
    );
  }

  // Replacing https://github.com/bvaughn/react-virtualized/blob/master/source/Table/defaultHeaderRenderer.js
  renderHeaderCell(params) {
    const {dataKey, label, sortBy, sortDirection} = params;
    const showSortIndicator = sortBy === dataKey;

    const children = [
      <span
        className="ReactVirtualized__Table__headerTruncatedText"
        style={{verticalAlign: 'top'}} // this is the meaningful change
        key="label"
        title={label}>
        {label}
      </span>
    ];

    if (showSortIndicator) {
      children.push(
        <SortIndicator key="SortIndicator" sortDirection={sortDirection} />
      );
    }

    return children;
  }
}
StudentLevelsTable.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
StudentLevelsTable.propTypes = {
  orderedStudentsWithLevels: PropTypes.array.isRequired,
  sortBy: PropTypes.string.isRequired,
  sortDirection: PropTypes.oneOf([
    SortDirection.ASC,
    SortDirection.DESC
  ]).isRequired,
  onTableSort: PropTypes.func.isRequired
};

const supportColor = 'rgb(74, 143, 225)';
const warningColor = 'rgb(255, 231, 214)';
const strengthColor = 'rgba(77, 136, 77, 0.9)';
const structureColor = 'rgba(51, 51, 51, 0.5)';
const styles = {
  root: {
    flex: 1,
    display: 'block',
    flexDirection: 'column',
    // works around bug with the way `react-virtualized` resizes that impacts
    // Windows 10 Chromebooks in particular, and I haven't been able to reproduce
    // in a VM
    overflow: 'hidden'
  },
  tableHeaderStyle: {
    fontSize: 12,
    fontWeight: 'normal',
    borderBottom: '1px solid #aaa',
    paddingBottom: 3,
    height: '100%',
    cursor: 'pointer'
  },
  grade: {
    display: 'inline-block',
    width: 35,
    textAlign: 'center',
    padding: 8,
    cursor: 'default'
  },
  person: {
    fontWeight: 'bold',
    fontSize: 14
  },
  support: {
    display: 'inline-block',
    textAlign: 'center',
    padding: 4,
    backgroundColor: supportColor,
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
  }
};


// This is used both for react-virtualized and interpreted to make the CSV export.
export function describeColumns(nowMoment) {
  const gradeCellWidth = 50;
  const numericCellWidth = 60;
  const supportCellWidth = 60;

  return [{
    dataKey: 'student',
    label: 'Student',
    width: 140,
    flexGrow:1,
    cellRenderer: renderStudent
  }, {
    dataKey: 'level',
    label: 'Level',
    width: gradeCellWidth,
    cellRenderer: renderLevel
  }, {
    dataKey: 'absence',
    label: 'Attendance Rate',
    width: numericCellWidth,
    cellRenderer: renderAbsenceRate
  }, {
    dataKey: 'discipline',
    label: 'Discipline Incidents',
    width: numericCellWidth,
    cellRenderer: renderDisciplineIncidents
  }, {
    dataKey: 'english_or_core_ell',
    label: 'EN or ELL',
    width: gradeCellWidth,
    cellRenderer: renderGradeFor.bind(null, ENGLISH_OR_CORE_ELL)
  }, {
    dataKey: 'social_studies',
    label: 'Social Studies',
    width: gradeCellWidth,
    cellRenderer: renderGradeFor.bind(null, SOCIAL_STUDIES)
  }, {
    dataKey: 'math',
    label: 'Math',
    width: gradeCellWidth,
    cellRenderer: renderGradeFor.bind(null, MATH)
  }, {
    dataKey: 'science',
    label: 'Science',
    width: gradeCellWidth,
    cellRenderer: renderGradeFor.bind(null, SCIENCE)
  }, {
    dataKey: 'nge',
    label: 'Last xGE or NEST',
    width: supportCellWidth,
    cellRenderer: renderNotes.bind(null, nowMoment, 'last_experience_note')
  }, {
    dataKey: 'sst',
    label: 'Last SST',
    width: supportCellWidth,
    cellRenderer: renderNotes.bind(null, nowMoment, 'last_sst_note')
  }, {
    dataKey: 'other_note',
    label: 'Other notes',
    width: supportCellWidth,
    cellRenderer: renderNotes.bind(null, nowMoment, 'last_other_note')
  }, {
    dataKey: 'study',
    label: 'Study skills',
    width: supportCellWidth,
    cellRenderer: renderIfEnrolled.bind(null, STUDY_SKILLS, 'study')
  }, {
    dataKey: 'support',
    label: 'Academic Support',
    width: supportCellWidth,
    cellRenderer: renderIfEnrolled.bind(null, ACADEMIC_SUPPORT, 'support')
  }, {
    dataKey: 'redirect',
    label: 'Redirect',
    width: supportCellWidth,
    cellRenderer: renderIfEnrolled.bind(null, REDIRECT, 'redirect')
  }, {
    dataKey: 'recovery',
    label: 'Credit Recovery',
    width: supportCellWidth,
    cellRenderer: renderIfEnrolled.bind(null, CREDIT_RECOVERY, 'recovery')
  }, {
    dataKey: 'program_assigned',
    label: 'Program or SPED',
    width: supportCellWidth,
    cellRenderer: renderProgram
  }];
}

// The linter wants propTypes for all these now that they're factored out from
// methods into functions; adding these isn't particularly helpful.
/* eslint-disable react/prop-types */
function renderStudent({rowData}) {
  const student = rowData;
  return <a style={styles.person} target="_blank" href={`/students/${student.id}`}>{student.first_name} {student.last_name}</a>;
}

function renderLevel({rowData}) {
  return <span style={{textAlign: 'center'}}>{rowData.level.level_number}</span>;
}

function renderDisciplineIncidents({rowData}) {
  const {level} = rowData;
  const count = level.data.recent_discipline_actions;
  const style = (level.triggers.indexOf('discipline') !== -1)
    ? styles.warn
    : styles.plain;
  return <span style={style}>{count}</span>; 
}

function renderAbsenceRate({rowData}) {
  const {level} = rowData;
  const percentage = Math.round(level.data.recent_absence_rate * 100);
  const style = (level.triggers.indexOf('absence') !== -1)
    ? styles.warn
    : styles.plain;
  return <span style={style}>{percentage}%</span>; 
}

function renderGradeFor(patterns, {rowData}) {
  const student = rowData;
  const assignment = firstMatchWithGrades(student.student_section_assignments_right_now, patterns);
  return (assignment)
    ? renderGrade(assignment, assignment.grade_letter)
    : null;
}

function renderIfEnrolled(patterns, el, {rowData}) {
  const student = rowData;
  const assignment = firstMatch(student.student_section_assignments_right_now, patterns);
  return (assignment)
    ? <span style={{...styles.support, backgroundColor: structureColor}}>{el}</span>
    : null;
}

function renderProgram({rowData}) {
  const student = rowData;
  const programText = prettyProgramOrPlacementText(student);

  return (programText !== null)
    ? <span style={{...styles.support, backgroundColor: structureColor}}>{programText}</span>
    : null;
}

function renderGrade(assignment, gradeLetter) {
  if (!gradeLetter) return null;

  var gradeStyles = {}; // eslint-disable-line no-var
  if (gradeLetter.indexOf('F') !== -1) {
    gradeStyles = { backgroundColor: warningColor, color: '#666'};
  } else if (gradeLetter.indexOf('D') !== -1) {
    gradeStyles = { backgroundColor: warningColor, color: '#666'};
  } else if (gradeLetter.indexOf('B') !== -1) {
    gradeStyles = { backgroundColor: strengthColor, color: 'white'};
  } else if (gradeLetter.indexOf('A') !== -1) {
    gradeStyles = { backgroundColor: strengthColor, color: 'white'};
  }
  return (
    <span
      title={assignment.section.course_description}
      style={{...styles.grade, ...gradeStyles}}>
      {gradeLetter}
    </span>
  );
}

function renderNotes(nowMoment, key, {rowData}) {
  const eventNote = rowData.notes[key];
  if (eventNote === undefined) return null;
  if (eventNote.recorded_at === undefined) return null;

  const noteMoment = toMomentFromTimestamp(eventNote.recorded_at);
  const daysAgo = nowMoment.clone().diff(noteMoment, 'days');
  if (daysAgo > 45) return null;
  const daysAgoText = (daysAgo === 0)
    ? 'today'
    : (daysAgo === 1) ? 'yesterday' : `${daysAgo} days`;
  return <span style={{...styles.support, fontSize: 12}}>{daysAgoText}</span>;
}
/* eslint-enable react/prop-types */



// This is used both for react-virtualized and interpreted to make the CSV export.
// It's not called in this component, but is defined here since it's so coupled to the implementation
// of the columns.
export function orderedStudents(studentsWithLevels, sortBy, sortDirection) {
  // map dataKey to an accessor/sort function
  const sortFns = {
    student(student) { return `${student.last_name}, ${student.first_name}`; },
    level(student) { return student.level.level_number; },
    absence(student) { return student.level.data.recent_absence_rate; },
    discipline(student) { return student.level.data.recent_discipline_actions; },
    english_or_core_ell(student) { return sortByGrade(ENGLISH_OR_CORE_ELL, student); },
    social_studies(student) { return sortByGrade(SOCIAL_STUDIES, student); },
    math(student) { return sortByGrade(MATH, student); },
    science(student) { return sortByGrade(SCIENCE, student); },
    nge(student) { return sortTimestamp(student.notes.last_experience_note.recorded_at); },
    sst(student) { return sortTimestamp(student.notes.last_sst_note.recorded_at); },
    other_note(student) { return sortTimestamp(student.notes.last_other_note.recorded_at); },
    study(student) { return sortIfEnrolled(STUDY_SKILLS, student); },
    support(student) { return sortIfEnrolled(ACADEMIC_SUPPORT, student); },
    redirect(student) { return sortIfEnrolled(REDIRECT, student); },
    recovery(student) { return sortIfEnrolled(CREDIT_RECOVERY, student); },
    program_assigned(student) { return prettyProgramOrPlacementText(student); },
    fallback(student) { return student[sortBy]; }
  };

  // "Natural" sort order, before table sorting
  const sortFn = sortFns[sortBy] || sortFns.fallback;
  const sortedRows = _.sortBy(studentsWithLevels, [
    (s => sortFn(s)),
    (s => s.level.level_number),
    (s => s.level.triggers.length),
    (s => s.level.triggers.sort()),
    (s => s.last_name),
    (s => s.first_name)
  ]);

  // sort and respect direction
  return (sortDirection === SortDirection.DESC) 
    ? sortedRows.reverse()
    : sortedRows;
}

function sortByGrade(patterns, student) {
  const assignment = firstMatchWithGrades(student.student_section_assignments_right_now, patterns);
  return (assignment && assignment.grade_letter)
    ? rankedByLetterGrade(assignment.grade_letter)
    : Number.POSITIVE_INFINITY;
}

function sortIfEnrolled(patterns, student) {
  const assignment = firstMatch(student.student_section_assignments_right_now, patterns);
  return (assignment) ? 1 : 0;
}

function sortTimestamp(maybeString) {
  return (maybeString)
    ? moment.utc(maybeString).unix()
    : Number.NEGATIVE_INFINITY;
}
