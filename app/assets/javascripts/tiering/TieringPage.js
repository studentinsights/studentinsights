import React from 'react';
import _ from 'lodash';
import Select from 'react-select'
import Card from '../components/Card';
import SectionHeading from '../components/SectionHeading';
import ExperimentalBanner from '../components/ExperimentalBanner';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';

// import 'css-loader?react-select/dist/react-select.css';

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
        <div style={styles.card}>
          <SectionHeading>Tiering: v1 prototype</SectionHeading>
          <p>Tiering is computed over the last 45 days, looking at academic grades, absences and discipline incidents (NOTE: not actions yet).</p>
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
      grade: 'All'
    };
  }

  render() {
    const {studentsWithTiering} = this.props;
    const {grade} = this.state;
    const students = (grade === 'All')
      ? studentsWithTiering
      : studentsWithTiering.filter(s => s.grade === grade);
    return (
      <div style={styles.card}>
        {this.renderSelection(students)}
        {this.renderSummary(students)}
        {this.renderTable(students)}
      </div>
    );
  }

  renderSelection(studentsWithTiering) {
    const {grade} = this.state;
    const possibleGrades = ['All', '9', '10', '11', '12'];
    return (
      <div>
        <Select
          style={{width: '8em', marginLeft: 20}}
          simpleValue
          clearable={false}
          searchable={false}
          value={grade}
          onChange={this.onGradeChanged}
          options={possibleGrades.map(value => {
            return { value: `${value}`, label: `Year: ${value}` };
          })} />
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
    // TODO(kr) hacked sorting
    const sortedStudentsWithTiering = _.sortBy(studentsWithTiering, s => {
      return s.tier.level * -1 * 10 + s.tier.triggers.length * -1;
    });
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
  person: {
    fontWeight: 'bold'
  },
  card: {
    padding: 10,
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
  }
};

export default TieringPage;