import React from 'react';
import _ from 'lodash';
import Select from 'react-select';
import {Table, Column, AutoSizer} from 'react-virtualized';
import SectionHeading from '../components/SectionHeading';
import ExperimentalBanner from '../components/ExperimentalBanner';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css'




function firstMatch(assignments, patterns) {
  return _.first(assignments.filter(assignment => {
    const text = assignment.section.course_description;
    return _.any(patterns, pattern => text.indexOf(pattern) !== -1);
  }));
}

const ELA = [
  'ENGLISH',
  'ESL'
];

const HISTORY = [
  'HISTORY'
];

const MATH = [
  'GEOMETRY',
  'ALGEBRA',
  'MATH'
];

const SCIENCE = [
  'BIOLOGY',
  'PHYSICS',
  'CHEMISTRY',
];

const LANGUAGE = [
  'LANGUAGE'
];

const HEALTH = [
  'HEALTH',
  'FITNESS EDUCATION',
  'TEAM ACTIVITIES PE'
];

const REDIRECT = [
  'REDIRECT'
];

const ACADEMIC_SUPPORT = [
  'ACADEMIC SUPPORT'
];

const CREDIT_RECOVERY = [
  'CREDIT RECOVERY'
];


// 'ELECTRICAL'
// 'PIANO'
// 'ART'
// 'TEAM ACTIVITIES PE'
// 'BIOTECHNOLOGY'
// 'GEOMETRY'
// 'INTERNSHIP'
// 'BAND'
// 'COMPUTER ART'

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
          <SectionHeading>Tiering: v1 prototype</SectionHeading>
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
      grade: 'All',
      house: 'All',
      tier: 'All',
      trigger: 'All'
    };

    this.onGradeChanged = this.onGradeChanged.bind(this);
    this.onHouseChanged = this.onHouseChanged.bind(this);
    this.onTierChanged = this.onTierChanged.bind(this);
    this.onTriggerChanged = this.onTriggerChanged.bind(this);
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

  render() {
    const {studentsWithTiering} = this.props;
    const {grade, house, tier, trigger} = this.state;
    const students = studentsWithTiering.filter(s => {
      if (grade !== 'All' && s.grade !== grade) return false;
      if (house !== 'All' && s.house !== house) return false;
      if (tier !== 'All' && s.tier.level !== parseInt(tier, 0)) return false;
      if (trigger !== 'All' && s.tier.triggers.indexOf(trigger) === -1) return false;
      return true;
    });

    return (
      <div style={styles.root}>
        {this.renderSelection(students)}
        {this.renderSummary(students)}
        {this.renderTable(students)}
      </div>
    );
  }

  renderSelection(studentsWithTiering) {
    const {grade, house, tier, trigger} = this.state;
    const possibleGrades = ['All', '9', '10', '11', '12'];
    const possibleHouses = ['All', 'Beacon'];
    const possibleTiers = ['All', '0', '1', '2', '3', '4'];
    const possibleTriggers = ['All', 'academic', 'absence', 'discipline'];
    return (
      <div style={styles.selectionBar}>
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
        <span style={styles.tieringInfo}>Tiering is computed over the last 45 days</span>
      </div>
    );
  }

  renderSummary(studentsWithTiering) {
    return (
      <div style={styles.columnsContainer}>
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
      </div>
    );
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
      (s => s.last_name),
      (s => s.first_name)
    ]);

    const gradeCellWidth = 50;
    const cellWidth = 80;
    return <AutoSizer disableHeight>
      {({width}) => (
        <Table
          headerHeight={60}
          height={300}
          rowCount={sortedStudentsWithTiering.length}
          rowGetter={({index}) => sortedStudentsWithTiering[index]}
          rowHeight={60}
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
            dataKey="academic"
            label="academic"
            width={cellWidth}
            cellRenderer={this.renderTriggerIf.bind(this, 'academic')} />
          <Column
            dataKey="absence"
            label="absence"
            width={cellWidth}
            cellRenderer={this.renderTriggerIf.bind(this, 'absence')} />
          <Column
            dataKey="discipline"
            label="discipline"
            width={cellWidth}
            cellRenderer={this.renderTriggerIf.bind(this, 'discipline')} />
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
        </Table>
      )}
    </AutoSizer>;
  }

  renderStudent({rowData}) {
    const student = rowData;
    return <a style={styles.person} target="_blank" href={`https://somerville.studentinsights.org/students/${student.id}`}>{student.first_name} {student.last_name}</a>;
  }

  renderLevel({rowData}) {
    return rowData.tier.level;
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
      ? el
      : null;
  }

  renderTriggerIf(trigger, {rowData}) {
    return (rowData.tier.triggers.indexOf(trigger) !== -1)
      ? trigger
      : null;
  }

  renderOldTable(sortedStudentsWithTiering) {
    return (
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.cell}>Student</th>
            <th style={styles.cell}>Tier</th>
            <th style={styles.cell}>Triggers</th>
            <th style={styles.cell}>ELA</th>
            <th style={styles.cell}>History</th>
            <th style={styles.cell}>Math</th>
            <th style={styles.cell}>Science</th>
            <th style={styles.cell}>World<br/>Languages</th>
            <th style={styles.cell}>Health</th>
            <th style={styles.cell}>Credit<br/>Recovery?</th>
            <th style={styles.cell}>Academic<br/>Support?</th>
            <th style={styles.cell}>Redirect?</th>
          </tr>
        </thead>
        <tbody>{sortedStudentsWithTiering.map(studentWithTiering => {
          const {tier} = studentWithTiering;
          const student = studentWithTiering;

          // TODO(kr) absences
          const ela = firstMatch(student.student_section_assignments, ELA);
          const history = firstMatch(student.student_section_assignments, HISTORY);
          const math = firstMatch(student.student_section_assignments, MATH);
          const science = firstMatch(student.student_section_assignments, SCIENCE);
          const language = firstMatch(student.student_section_assignments, LANGUAGE);
          const health = firstMatch(student.student_section_assignments, HEALTH);

          // adapting
          const redirect = firstMatch(student.student_section_assignments, REDIRECT);
          const academicSupport = firstMatch(student.student_section_assignments, ACADEMIC_SUPPORT);
          const creditRecovery = firstMatch(student.student_section_assignments, CREDIT_RECOVERY);

          // const others = _.differenceBy(
          //   student.student_section_assignments,
          //   _.compact([ela, history, math, science, language, health]),
          //   (a => a.id)
          // );

          return (
            <tr key={studentWithTiering.id}>
              <td style={styles.cell}><a style={styles.person} target="_blank" href={`https://somerville.studentinsights.org/students/${student.id}`}>{student.first_name} {student.last_name}</a></td>
              <td style={styles.cell}>{tier.level}</td>
              <td style={styles.cell}>{tier.triggers.join(' ')}</td>
              <td style={styles.cell}>{ela && this.renderGrade(ela.grade_letter)}</td>
              <td style={styles.cell}>{history && this.renderGrade(history.grade_letter)}</td>
              <td style={styles.cell}>{math && this.renderGrade(math.grade_letter)}</td>
              <td style={styles.cell}>{science && this.renderGrade(science.grade_letter)}</td>
              <td style={styles.cell}>{language && this.renderGrade(language.grade_letter)}</td>
              <td style={styles.cell}>{health && this.renderGrade(health.grade_letter)}</td>
              <td style={styles.cell}>{creditRecovery && <b>credit<br/>recovery</b>}</td>
              <td style={styles.cell}>{academicSupport && <b>academic<br/>support</b>}</td>
              <td style={styles.cell}>{redirect && <b>redirect</b>}</td>
            </tr>
          );
        })}</tbody>
      </table>
    );
  }

  renderGrade(gradeLetter) {
    if (!gradeLetter) return null;

    if (gradeLetter.indexOf('F') !== -1) {
      return <span style={{display: 'inline-block', width: '3em', textAlign: 'center', padding: 10, backgroundColor: 'red'}}>{gradeLetter}</span>;
    } else if (gradeLetter.indexOf('D') !== -1) {
      return <span style={{display: 'inline-block', width: '3em', textAlign: 'center', padding: 10, backgroundColor: 'orange'}}>{gradeLetter}</span>;
    }
    return <span style={{display: 'inline-block', width: '3em', textAlign: 'center', padding: 10}}>{gradeLetter}</span>;
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
  columnsContainer: {
    display: 'flex'
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
  }
};

export default TieringPage;