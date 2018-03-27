import React from 'react';
import _ from 'lodash';
import Select from 'react-select';
import {Table, Column, AutoSizer} from 'react-virtualized';
import SectionHeading from '../components/SectionHeading';
import ExperimentalBanner from '../components/ExperimentalBanner';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css';
import {toMomentFromTime} from '../helpers/toMoment';
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




// TODO(kr)
class TieringPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchTiering = this.fetchTiering.bind(this);
    this.renderTiering = this.renderTiering.bind(this);
  }

  fetchTiering() {
    const {schoolId} = this.props;
    const url = `/api/tiering/${schoolId}`;
    return apiFetchJson(url).then(json => json.students_with_tiering);
  }

  render() {
    return (
      <div className="TieringPage">
        <ExperimentalBanner />
        <div style={styles.section}>
          <SectionHeading>HS Tiering: v1 prototype</SectionHeading>
        </div>
        <GenericLoader
          promiseFn={this.fetchTiering}
          render={this.renderTiering} />
      </div>
    );
  }

  renderTiering(studentsWithTiering) {
    return <TieringView studentsWithTiering={studentsWithTiering} />;
  }
}
TieringPage.propTypes = {
  schoolId: React.PropTypes.string.isRequired
};


class TieringView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      grade: 'All',
      house: 'All',
      tier: 'All',
      trigger: 'All'
    };

    this.onGradeChanged = this.onGradeChanged.bind(this);
    this.onHouseChanged = this.onHouseChanged.bind(this);
    this.onTierChanged = this.onTierChanged.bind(this);
    this.onTriggerChanged = this.onTriggerChanged.bind(this);
    this.onSearchChanged = this.onSearchChanged.bind(this);
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

  render() {
    const {studentsWithTiering} = this.props;
    const {grade, house, tier, trigger, search} = this.state;
    const students = studentsWithTiering.filter(s => {
      if (grade !== 'All' && s.grade !== grade) return false;
      if (house !== 'All' && s.house !== house) return false;
      if (tier !== 'All' && s.tier.level !== parseInt(tier, 0)) return false;
      if (trigger !== 'All' && s.tier.triggers.indexOf(trigger) === -1) return false;
      
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

    return (
      <div style={styles.root}>
        {this.renderSelection(students)}
        {/*this.renderSummary(students)*/}
        {this.renderTable(students)}
      </div>
    );
  }

  renderSelection(studentsWithTiering) {
    const {grade, house, tier, trigger, search} = this.state;
    const possibleGrades = ['All', '9', '10', '11', '12'];
    const possibleHouses = ['All', 'Beacon', 'Broadway', 'Elm', 'Highland'];
    const possibleTiers = ['All', '0', '1', '2', '3', '4'];
    const possibleTriggers = ['All', 'academic', 'absence', 'discipline'];
    return (
      <div style={styles.selectionBar}>
        <input
          style={styles.search}
          placeholder="Search..."
          value={search}
          onChange={this.onSearchChanged} />
        <Select
          style={styles.select}
          simpleValue
          clearable={false}
          searchable={false}
          value={grade}
          onChange={this.onGradeChanged}
          options={possibleGrades.map(value => {
            return { value: `${value}`, label: `Grade: ${value}` };
          })} />
        <Select
          style={styles.select}
          simpleValue
          clearable={false}
          searchable={false}
          value={house}
          onChange={this.onHouseChanged}
          options={possibleHouses.map(value => {
            return { value: `${value}`, label: `House: ${value}` };
          })} />
        <Select
          style={styles.select}
          simpleValue
          clearable={false}
          searchable={false}
          value={tier}
          onChange={this.onTierChanged}
          options={possibleTiers.map(value => {
            return { value: `${value}`, label: `Tier: ${value}` };
          })} />
        <Select
          style={styles.select}
          simpleValue
          clearable={false}
          searchable={false}
          value={trigger}
          onChange={this.onTriggerChanged}
          options={possibleTriggers.map(value => {
            return { value: `${value}`, label: `Trigger: ${value}` };
          })} />
        <span style={styles.tieringInfo}>Data is over the last 45 days</span>
      </div>
    );
  }

  renderSummary(studentsWithTiering) {
    return (
      <div style={styles.summaryContainer}>
        <div style={styles.column}>
          {this.renderTierCount(studentsWithTiering, 0)}
          {this.renderTierCount(studentsWithTiering, 1)}
          {this.renderTierCount(studentsWithTiering, 2)}
          {this.renderTierCount(studentsWithTiering, 3)}
          {this.renderTierCount(studentsWithTiering, 4)}
        </div>
        <div style={styles.column}>
          {this.renderTriggerCount(studentsWithTiering)}
        </div>
        <div style={styles.column}>
          {this.renderServiceCount(studentsWithTiering, 'Credit recovery', CREDIT_RECOVERY)}
          {this.renderServiceCount(studentsWithTiering, 'Academic support', ACADEMIC_SUPPORT)}
          {this.renderServiceCount(studentsWithTiering, 'Redirect', REDIRECT)}
        </div>
        <div>
          {this.renderUnlabeledCourses(studentsWithTiering)}
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
    return <div>Tier {n}: {count}, {percentage}%</div>;
  }

  renderTriggerCount(studentsWithTiering) {
    const triggers = _.uniq(_.flatten(studentsWithTiering.map(s => s.tier.triggers)));
    return (
      <div>{triggers.map(trigger => {
        const count = studentsWithTiering.filter(s => s.tier.triggers.indexOf(trigger) !== -1).length;
        const percentage = Math.round(100 * count / studentsWithTiering.length);
        return <div key={trigger}><b>{trigger}</b> trigger: {percentage}% ({count} students)</div>;
      })}</div>
    );
  }

  renderServiceCount(studentsWithTiering, text, patterns) {
    const count = studentsWithTiering.filter(s => {
      return firstMatch(s.student_section_assignments, patterns) !== undefined;
    }).length;
    const percentage = Math.round(100 * count / studentsWithTiering.length);
    return <div><b>{text}</b>: {percentage}% ({count} students)</div>;
  }

  renderTable(studentsWithTiering) {
    const sortedStudentsWithTiering = _.sortByOrder(studentsWithTiering, [
      (s => s.tier.level * -1),
      (s => s.tier.triggers.length * -1),
      (s => s.tier.triggers.sort()),
      (s => s.last_name),
      (s => s.first_name)
    ]);

    const gradeCellWidth = 40;
    const numericCellWidth = 60;
    const cellWidth = 90;
    return (
      <div style={styles.tableContainer}>
        <AutoSizer disableHeight>
          {({width}) => (
            <Table
              headerHeight={40}
              height={450}
              rowCount={sortedStudentsWithTiering.length}
              rowGetter={({index}) => sortedStudentsWithTiering[index]}
              rowHeight={40}
              width={width}
            >
              <Column
                dataKey="student"
                label="student"
                width={200}
                flexGrow={1}
                cellRenderer={this.renderStudent} />
              <Column
                dataKey="level"
                label="level"
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
                label="ela"
                width={gradeCellWidth}
                cellRenderer={this.renderGradeFor.bind(this, ELA)} />
              <Column
                dataKey="history"
                label="history"
                width={gradeCellWidth}
                cellRenderer={this.renderGradeFor.bind(this, HISTORY)} />
              <Column
                dataKey="math"
                label="math"
                width={gradeCellWidth}
                cellRenderer={this.renderGradeFor.bind(this, MATH)} />
              <Column
                dataKey="science"
                label="science"
                width={gradeCellWidth}
                cellRenderer={this.renderGradeFor.bind(this, SCIENCE)} />
              <Column
                dataKey="sped"
                label={<span>Special<br />education</span>}
                width={cellWidth}
                cellRenderer={this.renderPlacement} />
              <Column
                dataKey="recovery"
                label={<span>Credit<br/>Recovery</span>}
                width={cellWidth}
                cellRenderer={this.renderIf.bind(this, CREDIT_RECOVERY, 'recovery')} />
              <Column
                dataKey="redirect"
                label="Redirect"
                width={cellWidth}
                cellRenderer={this.renderIf.bind(this, REDIRECT, 'redirect')} />
              <Column
                dataKey="support"
                label={<span>Academic<br/>Support</span>}
                width={cellWidth}
                cellRenderer={this.renderIf.bind(this, ACADEMIC_SUPPORT, 'support')} />
              <Column
                dataKey="sst"
                label="SST"
                width={cellWidth}
                cellRenderer={this.renderNotes.bind(this, 'last_sst_note')} />
              <Column
                dataKey="nge"
                label="NGE/10GE"
                width={cellWidth}
                cellRenderer={this.renderNotes.bind(this, 'last_experience_note')} />
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

  renderPlacement({rowData}) {
    const placement = rowData.sped_placement;
    return (placement && placement !== 'None')
      ? <span style={styles.support}>{placement}</span>
      : null;
  }

  renderGrade(gradeLetter) {
    if (!gradeLetter) return null;

    if (gradeLetter.indexOf('F') !== -1) {
      return <span style={{...styles.grade, backgroundColor: 'hsla(25, 100%, 70%, 1)'}}>{gradeLetter}</span>;
    } else if (gradeLetter.indexOf('D') !== -1) {
      return <span style={{...styles.grade, backgroundColor: 'hsla(25, 100%, 70%, 1)'}}>{gradeLetter}</span>;
    } else if (gradeLetter.indexOf('B') !== -1) {
      return <span style={{...styles.grade, backgroundColor: 'darkgreen', color: 'white'}}>{gradeLetter}</span>;
    } else if (gradeLetter.indexOf('A') !== -1) {
      return <span style={{...styles.grade, backgroundColor: 'darkgreen', color: 'white'}}>{gradeLetter}</span>;
    }
    return <span style={styles.grade}>{gradeLetter}</span>;
  }

  renderNotes(key, {rowData}) {
    const eventNote = rowData.notes[key];
    if (eventNote === undefined) return null;
    if (eventNote.recorded_at === undefined) return null;

    const noteMoment = toMomentFromTime(eventNote.recorded_at);
    return <span style={styles.support}>{noteMoment.format('M/D/YY')}</span>;
  }
}



// TODO(kr) type this
TieringView.propTypes = {
  studentsWithTiering: React.PropTypes.array.isRequired
};


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
    padding: 8,
    backgroundColor: '#3177c9',
    color: 'white'
  },
  grade:{
    display: 'inline-block',
    width: 35,
    textAlign: 'center',
    padding: 8
  },
  warn: {
    display: 'inline-block',
    backgroundColor: 'hsla(25, 100%, 70%, 1)',
    padding: 8
  },
  plain: {
    display: 'inline-block',
    padding: 8
  },
  search: {
    display: 'inline-block',
    padding: 8,
    borderRadius: 3,
    border: '1px solid #ddd',
    marginLeft: 20,
    width: 200
  },
  tableContainer: {
    marginLeft: 10,
    marginTop: 20
  }
};

export default TieringPage;