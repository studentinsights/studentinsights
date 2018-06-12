import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Select from 'react-select';
import Modal from 'react-modal';
import {Table, Column, AutoSizer} from 'react-virtualized';
import 'react-select/dist/react-select.css';
import {toMomentFromTime} from '../helpers/toMoment';
import {gradeText} from '../helpers/gradeText';
import {
  labelAssignment,
  firstMatch,
  ELA,
  MATH,
  HISTORY,
  SCIENCE,
  CREDIT_RECOVERY,
  ACADEMIC_SUPPORT,
  REDIRECT
} from './Courses';


export default class TieringView extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState();

    this.onKeyUp = this.onKeyUp.bind(this);
    this.onGradeChanged = this.onGradeChanged.bind(this);
    this.onHouseChanged = this.onHouseChanged.bind(this);
    this.onTierChanged = this.onTierChanged.bind(this);
    this.onTriggerChanged = this.onTriggerChanged.bind(this);
    this.onSearchChanged = this.onSearchChanged.bind(this);
    this.onToggleModal = this.onToggleModal.bind(this);
  }

  filterStudents() {
    const {studentsWithTiering} = this.props;
    const {grade, house, tier, trigger, search} = this.state;
    return studentsWithTiering.filter(s => {
      if (grade !== null && s.grade !== grade) return false;
      if (house !== null && s.house !== house) return false;
      if (tier !== null && s.tier.level !== parseInt(tier, 0)) return false;
      if (trigger !== null && s.tier.triggers.indexOf(trigger) === -1) return false;
      
      if (search !== '') {
        const tokens = search.toLowerCase().split(' ');
        const matchesAllTokens = _.all(tokens, token => {
          if (s.first_name.toLowerCase().indexOf(token) !== -1) return true;
          if (s.last_name.toLowerCase().indexOf(token) !== -1) return true;
          return false;
        });
        return matchesAllTokens;
      }

      return true;
    });
  }

  onKeyUp(e) {
    if (e.which === 27) this.setState(initialState());
  }

  onGradeChanged(grade) {
    this.setState({grade});
  }

  onHouseChanged(house) {
    this.setState({house});
  }

  onTierChanged(tier) {
    this.setState({tier});
  }

  onTriggerChanged(trigger) {
    this.setState({trigger});
  }

  onSearchChanged(e) {
    const search = e.target.value;
    this.setState({search});
  }

  onToggleModal() {
    const {isModalOpen} = this.state;
    this.setState({isModalOpen: !isModalOpen});
  }

  render() {
    const students = this.filterStudents();
    return (
      <div className="TieringView" style={styles.root} onKeyUp={this.onKeyUp}>
        {this.renderSelection(students)}
        {this.renderTable(students)}
      </div>
    );
  }

  renderSelection(studentsWithTiering) {
    const {grade, house, tier, trigger, search} = this.state;

    const nullOption = [{ value: null, label: 'All' }];
    const possibleGrades = ['9', '10', '11', '12'];
    const possibleHouses = ['Beacon', 'Broadway', 'Elm', 'Highland'];
    const possibleTiers = ['0', '1', '2', '3', '4'];
    const possibleTriggers = ['academic', 'absence', 'discipline'];
    return (
      <div style={styles.selectionBar}>
        <input
          style={styles.search}
          placeholder={`Search ${studentsWithTiering.length} students...`}
          value={search}
          onChange={this.onSearchChanged} />
        <Select
          style={styles.select}
          simpleValue
          clearable={false}
          searchable={false}
          placeholder="Grade..."
          value={grade}
          onChange={this.onGradeChanged}
          options={nullOption.concat(possibleGrades.map(value => {
            return { value, label: gradeText(value) };
          }))} />
        <Select
          style={{...styles.select, width: '12em'}}
          simpleValue
          clearable={false}
          searchable={false}
          placeholder="House..."
          value={house}
          onChange={this.onHouseChanged}
          options={nullOption.concat(possibleHouses.map(value => {
            return { value, label: `${value} house` };
          }))} />
        <Select
          style={{...styles.select, width: '8em'}}
          simpleValue
          clearable={false}
          searchable={false}
          placeholder="Level..."
          value={tier}
          onChange={this.onTierChanged}
          options={nullOption.concat(possibleTiers.map(value => {
            return { value, label: `Level ${value}` };
          }))} />
        <Select
          style={styles.select}
          simpleValue
          clearable={false}
          searchable={false}
          placeholder="Trigger..."
          value={trigger}
          onChange={this.onTriggerChanged}
          options={nullOption.concat(possibleTriggers.map(value => {
            return { value, label: `${value} trigger` };
          }))} />
        <span style={styles.tieringInfo}>Last 45 days</span>
        {this.renderSummaryModal(studentsWithTiering)}
      </div>
    );
  }

  renderSummaryModal(studentsWithTiering) {
    const {isModalOpen} = this.state;
    return (
      <div>
        <a href="#" style={styles.summary} onClick={this.onToggleModal}>Summary</a>
        <Modal
          ariaHideApp={false}
          isOpen={isModalOpen}
          onRequestClose={this.onToggleModal}
          contentLabel="Modal"
        >
          {this.renderSummary(studentsWithTiering)}
        </Modal>
      </div>
    );
  }

  renderSummary(studentsWithTiering) {
    return (
      <div style={styles.summaryContainer}>
        <div style={styles.column}>
          <h4 style={{marginBottom: 10}}>by levels</h4>
          {this.renderTierCount(studentsWithTiering, 0)}
          {this.renderTierCount(studentsWithTiering, 1)}
          {this.renderTierCount(studentsWithTiering, 2)}
          {this.renderTierCount(studentsWithTiering, 3)}
          {this.renderTierCount(studentsWithTiering, 4)}
        </div>
        <div style={styles.column}>
          <h4 style={{marginBottom: 10}}>by triggers</h4>
          {this.renderTriggerCount(studentsWithTiering)}
        </div>
        <div style={styles.column}>
          <h4 style={{marginBottom: 10}}>by supports</h4>
          {this.renderServiceCount(studentsWithTiering, 'Credit recovery', CREDIT_RECOVERY)}
          {this.renderServiceCount(studentsWithTiering, 'Academic support', ACADEMIC_SUPPORT)}
          {this.renderServiceCount(studentsWithTiering, 'Redirect', REDIRECT)}
        </div>
      </div>
    );
  }

  renderUnlabeledCourses(studentsWithTiering) {
    const assignments = _.flatten(studentsWithTiering.map(s => s.student_section_assignments));
    const labeledAssignments = assignments.map(assignment => {
      return {
        ...assignment,
        label: labelAssignment(assignment)
      };
    });

    const missing = _.uniq(labeledAssignments
      .filter(a => a.label === 'unknown')
      .map(a => a.section.course_description))
      .slice(0, 10);

    return <div>
      <pre>{JSON.stringify(_.countBy(labeledAssignments, 'label'), null, 2)}</pre>
      <pre>{JSON.stringify(missing, null, 2)}</pre>
    </div>;
  }

  renderTierCount(studentsWithTiering, n) {
    const count = studentsWithTiering.filter(s => s.tier.level === n).length;
    const percentage = Math.round(100 * count / studentsWithTiering.length);
    return this.renderSummaryBit(`Level ${n}`, count, percentage);
  }

  renderTriggerCount(studentsWithTiering) {
    const triggers = _.uniq(_.flatten(studentsWithTiering.map(s => s.tier.triggers)));
    return (
      <div>{triggers.map(trigger => {
        const count = studentsWithTiering.filter(s => s.tier.triggers.indexOf(trigger) !== -1).length;
        const percentage = Math.round(100 * count / studentsWithTiering.length);
        return this.renderSummaryBit(trigger, count, percentage);
      })}</div>
    );
  }

  renderServiceCount(studentsWithTiering, text, patterns) {
    const count = studentsWithTiering.filter(s => {
      return firstMatch(s.student_section_assignments, patterns) !== undefined;
    }).length;
    const percentage = Math.round(100 * count / studentsWithTiering.length);
    return this.renderSummaryBit(text, count, percentage);
  }

  renderSummaryBit(label, count, percentage) {
    return (
      <div key={label}>
        <div><b>{label}</b>:</div>
        <div style={{marginLeft: 10, marginBottom: 5}}>{percentage}% ({count} students)</div>
      </div>
    );
  }

  renderTable(studentsWithTiering) {
    const sortedStudentsWithTiering = _.sortByOrder(studentsWithTiering, [
      (s => s.tier.level),
      (s => s.tier.triggers.length),
      (s => s.tier.triggers.sort()),
      (s => s.last_name),
      (s => s.first_name)
    ]);

    const gradeCellWidth = 50;
    const numericCellWidth = 70;
    const cellWidth = 85;
    return (
      <div style={styles.tableContainer}>
        <AutoSizer disableHeight>
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
      </div>
    );
  }

  renderStudent({rowData}) {
    const student = rowData;
    return <a style={styles.person} target="_blank" href={`https://somerville.studentinsights.org/students/${student.id}`}>{student.first_name} {student.last_name}</a>;
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
    const program = rowData.program_assigned;
    const spedPlacement = rowData.sped_placement;
    return (program && program !== 'Reg Ed')
      ? <span style={{...styles.support, fontSize: 12}}>{program === 'Sp Ed' ? spedPlacement : program}</span>
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
TieringView.contextTypes = {
  nowFn: React.PropTypes.func.isRequired
};
TieringView.propTypes = {
  studentsWithTiering: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    grade: PropTypes.string.isRequired,
    house: PropTypes.string,
    program_assigned: PropTypes.string,
    sped_placement: PropTypes.string,
    student_section_assignments: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      grade_letter: PropTypes.string,
      grade_numeric: PropTypes.string,
      section: PropTypes.shape({
        id: PropTypes.number.isRequired,
        section_number: PropTypes.string.isRequired,
        course_description: PropTypes.string.isRequired
      }).isRequired
    })).isRequired
  })).isRequired
};

const warningColor = 'rgb(255, 222, 198)';
const strengthColor = '#4d884d';
const styles = {
  root: {
    fontSize: 14
  },
  person: {
    fontWeight: 'bold',
    fontSize: 14
  },
  section: {
    margin: 10
  },
  summaryContainer: {
    display: 'flex',
    margin: 10
  },
  column: {
    flex: 1,
    margin: 10
  },
  table: {
    marginTop: 30
  },
  cell: {
    textAlign: 'left',
    verticalAlign: 'top'
  },
  selectionBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  select: {
    width: '10em',
    marginLeft: 20
  },
  tieringInfo: {
    marginLeft: 20,
    fontSize: 12,
    color: '#666'
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
  grade:{
    display: 'inline-block',
    width: 35,
    textAlign: 'center',
    padding: 8
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
  search: {
    display: 'inline-block',
    padding: 4,
    borderRadius: 3,
    border: '1px solid #ddd',
    marginLeft: 20,
    width: 150
  },
  tableContainer: {
    marginLeft: 10,
    marginTop: 20
  },
  tableHeaderStyle: {
    display: 'flex',
    fontSize: 12,
    fontWeight: 'normal',
    alignContent: 'flex-start',
    borderBottom: '1px solid #aaa',
    paddingBottom: 3,
    height: '100%'
  },
  summary: {
    padding: 5,
    marginLeft: 10,
    fontSize: 12
  }
};

function initialState() {
  return {
    search: '',
    grade: null,
    house: null,
    tier: null,
    trigger: null,
    isModalOpen: false
  };
}