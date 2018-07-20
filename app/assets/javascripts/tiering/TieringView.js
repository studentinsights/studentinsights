import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Modal from 'react-modal';
import EscapeListener from '../components/EscapeListener';
import FilterBar from '../components/FilterBar';
import SimpleFilterSelect, {ALL} from '../components/SimpleFilterSelect';
import SelectGrade from '../components/SelectGrade';
import SelectHouse from '../components/SelectHouse';
import {
  labelAssignment,
  firstMatch,
  CREDIT_RECOVERY,
  ACADEMIC_SUPPORT,
  REDIRECT
} from './Courses';
import StudentLevelsTable from './StudentLevelsTable';


// Experimental UI for HS tiering prototype
export default class TieringView extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState();

    this.onEscape = this.onEscape.bind(this);
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
      if (grade !== ALL && s.grade !== grade) return false;
      if (house !== ALL && s.house !== house) return false;
      if (tier !== ALL && s.tier.level !== parseInt(tier, 0)) return false;
      if (trigger !== ALL && s.tier.triggers.indexOf(trigger) === -1) return false;
      
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

  onEscape() {
    this.setState(initialState());
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
      <EscapeListener className="TieringView" style={{...styles.root, ...styles.flexVertical}} onEscape={this.onEscape}>
        {this.renderSelection(students)}
        {this.renderTable(students)}
      </EscapeListener>
    );
  }

  renderSelection(studentsWithTiering) {
    const {grade, house, tier, trigger, search} = this.state;

    const nullOption = [{ value: ALL, label: 'All' }];
    const possibleTiers = ['0', '1', '2', '3', '4'];
    const possibleTriggers = ['academic', 'absence', 'discipline'];
    return (
      <FilterBar>
        <input
          style={styles.search}
          placeholder={`Search ${studentsWithTiering.length} students...`}
          value={search}
          onChange={this.onSearchChanged} />
        <SelectGrade
          grade={grade}
          grades={['9', '10', '11', '12']}
          onChange={this.onGradeChanged} />
        <SelectHouse
          style={{width: '12em'}}
          house={house}
          onChange={this.onHouseChanged} />
        <SimpleFilterSelect
          style={{width: '8em'}}
          placeholder="Level..."
          value={tier}
          onChange={this.onTierChanged}
          options={nullOption.concat(possibleTiers.map(value => {
            return { value, label: `Level ${value}` };
          }))} />
        <SimpleFilterSelect
          placeholder="Trigger..."
          value={trigger}
          onChange={this.onTriggerChanged}
          options={nullOption.concat(possibleTriggers.map(value => {
            return { value, label: `${value} trigger` };
          }))} />
        <span style={styles.tieringInfo}>Last 45 days</span>
        {this.renderSummaryModal(studentsWithTiering)}
      </FilterBar>
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
        <div style={styles.summaryColumn}>
          <h4 style={{marginBottom: 10}}>by levels</h4>
          {this.renderTierCount(studentsWithTiering, 0)}
          {this.renderTierCount(studentsWithTiering, 1)}
          {this.renderTierCount(studentsWithTiering, 2)}
          {this.renderTierCount(studentsWithTiering, 3)}
          {this.renderTierCount(studentsWithTiering, 4)}
        </div>
        <div style={styles.summaryColumn}>
          <h4 style={{marginBottom: 10}}>by triggers</h4>
          {this.renderTriggerCount(studentsWithTiering)}
        </div>
        <div style={styles.summaryColumn}>
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

    return (
      <div style={{...styles.tableContainer, ...styles.flexVertical}}>
        <StudentLevelsTable sortedStudentsWithTiering={sortedStudentsWithTiering} />
      </div>
    );
  }
}
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

const styles = {
  root: {
    fontSize: 14
  },
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  search: {
    display: 'inline-block',
    padding: 8,
    paddingLeft: 10,
    borderRadius: 3,
    border: '1px solid #ddd',
    marginLeft: 20,
    fontSize: 12,
    width: 150
  },
  select: {
    width: '10em',
    marginLeft: 20
  },
  summaryContainer: {
    display: 'flex',
    margin: 10
  },
  summaryColumn: {
    flex: 1,
    margin: 10
  },
  tieringInfo: {
    marginLeft: 20,
    fontSize: 12,
    color: '#666'
  },
  tableContainer: {
    marginLeft: 10,
    marginTop: 20
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
    grade: ALL,
    house: ALL,
    tier: ALL,
    trigger: ALL,
    isModalOpen: false
  };
}