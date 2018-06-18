import React from 'react';
import PropTypes from 'prop-types';
import {Table, Column, AutoSizer} from 'react-virtualized';
import 'react-select/dist/react-select.css';
import {toMomentFromTime} from '../helpers/toMoment';
import {prettyProgramText} from '../helpers/PerDistrict';
import {
  firstMatch,
  ELA,
  MATH,
  HISTORY,
  SCIENCE,
  CREDIT_RECOVERY,
  ACADEMIC_SUPPORT,
  REDIRECT
} from './Courses';


// Render a virtualized table, with information and triggers on the
// left columns and supports on the right.
export default class StudentLevelsTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {sortedStudentsWithTiering} = this.props;
    const gradeCellWidth = 50;
    const numericCellWidth = 70;
    const cellWidth = 85;

    return (
      <AutoSizer className="StudentLevelsTable" disableHeight>
        {({width}) => (
          <Table
            width={width}
            headerHeight={40}
            height={450}
            rowCount={sortedStudentsWithTiering.length}
            rowGetter={({index}) => sortedStudentsWithTiering[index]}
            rowHeight={40}
            rowStyle={{display: 'flex', alignItems: 'center'}}
            headerStyle={styles.tableHeaderStyle}
          >
            <Column
              dataKey="student"
              label={<span><br />Student</span>}
              width={120}
              flexGrow={1}
              cellRenderer={this.renderStudent} />
            <Column
              dataKey="level"
              label={<span><br />Level</span>}
              width={gradeCellWidth}
              cellRenderer={this.renderLevel} />
            <Column
              dataKey="absence"
              label={<span>Absence<br/>Rate</span>}
              width={numericCellWidth}
              cellRenderer={this.renderAbsenceRate} />
            <Column
              dataKey="discipline"
              label={<span>Discipline<br/>Incidents</span>}
              width={numericCellWidth}
              cellRenderer={this.renderDisciplineIncidents} />
            <Column
              dataKey="ela"
              label={<span><br />ELA</span>}
              width={gradeCellWidth}
              cellRenderer={this.renderGradeFor.bind(this, ELA)} />
            <Column
              dataKey="history"
              label={<span>Social<br/>Studies</span>}
              width={gradeCellWidth}
              cellRenderer={this.renderGradeFor.bind(this, HISTORY)} />
            <Column
              dataKey="math"
              label={<span><br />Math</span>}
              width={gradeCellWidth}
              cellRenderer={this.renderGradeFor.bind(this, MATH)} />
            <Column
              dataKey="science"
              label={<span><br />Science</span>}
              width={gradeCellWidth}
              cellRenderer={this.renderGradeFor.bind(this, SCIENCE)} />
            <Column
              dataKey="nge"
              label={<span>Last NGE/<br/>10GE notes</span>}
              width={cellWidth}
              cellRenderer={this.renderNotes.bind(this, 'last_experience_note')} />
            <Column
              dataKey="sst"
              label={<span>Last SST<br/>notes</span>}
              width={cellWidth}
              cellRenderer={this.renderNotes.bind(this, 'last_sst_note')} />
            <Column
              dataKey="support"
              label={<span>Academic<br/>Support</span>}
              width={cellWidth}
              cellRenderer={this.renderIf.bind(this, ACADEMIC_SUPPORT, 'support')} />
            <Column
              dataKey="redirect"
              label={<span><br/>Redirect</span>}
              width={cellWidth}
              cellRenderer={this.renderIf.bind(this, REDIRECT, 'redirect')} />
            <Column
              dataKey="recovery"
              label={<span>Credit<br/>Recovery</span>}
              width={cellWidth}
              cellRenderer={this.renderIf.bind(this, CREDIT_RECOVERY, 'recovery')} />
            <Column
              dataKey="program_assigned"
              label={<span>Program<br/>or SPED</span>}
              width={cellWidth}
              cellRenderer={this.renderProgram} />
          </Table>
        )}
      </AutoSizer>
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
    const assignment = firstMatch(student.student_section_assignments, patterns);
    return (assignment)
      ? this.renderGrade(assignment.grade_letter)
      : null;
  }

  renderIf(patterns, el, {rowData}) {
    const student = rowData;
    const assignment = firstMatch(student.student_section_assignments, patterns);
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
    const programAssigned = rowData.program_assigned;
    const spedPlacement = rowData.sped_placement;
    const programText = prettyProgramText(programAssigned, spedPlacement);

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

    const noteMoment = toMomentFromTime(eventNote.recorded_at);
    const daysAgo = now.clone().diff(noteMoment, 'days');
    if (daysAgo > 45) return null;
    return <span style={{...styles.support, fontSize: 12}}>{daysAgo} days</span>;
  }
}
StudentLevelsTable.contextTypes = {
  nowFn: React.PropTypes.func.isRequired
};
StudentLevelsTable.propTypes = {
  sortedStudentsWithTiering: PropTypes.array.isRequired
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
    fontSize: 14,
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