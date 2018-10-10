import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import EscapeListener from '../components/EscapeListener';
import FilterBar from '../components/FilterBar';
import SimpleFilterSelect, {ALL} from '../components/SimpleFilterSelect';
import SelectGrade from '../components/SelectGrade';
import SelectHouse from '../components/SelectHouse';
import SelectEnglishProficiency from '../components/SelectEnglishProficiency';
import {
  labelAssignment,
  firstMatch,
  CREDIT_RECOVERY,
  ACADEMIC_SUPPORT,
  REDIRECT,
  STUDY_SKILLS
} from './Courses';
import StudentLevelsTable from './StudentLevelsTable';
import SupportGaps from './SupportGaps';
import HelpBubble, {
  modalFromRight,
  dialogFullScreenFlex
} from '../components/HelpBubble';


// Experimental UI for HS tiering prototype
export default class TieringView extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState();

    this.onEscape = this.onEscape.bind(this);
    this.onGradeChanged = this.onGradeChanged.bind(this);
    this.onEnglishProficiencyChanged = this.onEnglishProficiencyChanged.bind(this);
    this.onHouseChanged = this.onHouseChanged.bind(this);
    this.onTierChanged = this.onTierChanged.bind(this);
    this.onTriggerChanged = this.onTriggerChanged.bind(this);
    this.onSearchChanged = this.onSearchChanged.bind(this);
  }

  filterStudents() {
    const {studentsWithTiering} = this.props;
    const {grade, house, tier, trigger, englishProficiency, search} = this.state;
    return studentsWithTiering.filter(s => {
      if (grade !== ALL && s.grade !== grade) return false;
      if (englishProficiency !== ALL && s.limited_english_proficiency !== englishProficiency) return false;
      if (house !== ALL && s.house !== house) return false;
      if (tier !== ALL && s.tier.level !== parseInt(tier, 0)) return false;
      if (trigger !== ALL && s.tier.triggers.indexOf(trigger) === -1) return false;
      
      if (search !== '') {
        const tokens = search.toLowerCase().split(' ');
        const matchesAllTokens = _.every(tokens, token => {
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

  onEnglishProficiencyChanged(englishProficiency) {
    this.setState({englishProficiency});
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
    const filteredStudents = this.filterStudents();
    return (
      <EscapeListener className="TieringView" style={{...styles.root, ...styles.flexVertical}} onEscape={this.onEscape}>
        {this.renderSelection(filteredStudents)}
        {this.renderTable(filteredStudents)}
      </EscapeListener>
    );
  }

  renderSelection(filteredStudents) {
    const {grade, house, englishProficiency, tier, trigger, search} = this.state;

    const nullOption = [{ value: ALL, label: 'All' }];
    const possibleTiers = ['0', '1', '2', '3', '4'];
    const possibleTriggers = ['academic', 'absence', 'discipline'];
    return (
      <FilterBar style={styles.filterBar} barStyle={{flex: 1}} labelText="Filter">
        <input
          style={styles.search}
          placeholder={`Search ${filteredStudents.length} students...`}
          value={search}
          onChange={this.onSearchChanged} />
        <SelectEnglishProficiency
          style={{...styles.select, width: '10em'}}
          englishProficiency={englishProficiency}
          onChange={this.onEnglishProficiencyChanged} />
        <SelectGrade
          style={{...styles.select, width: '8em'}}
          grade={grade}
          grades={['9', '10', '11', '12']}
          onChange={this.onGradeChanged} />
        <SelectHouse
          style={{...styles.select, width: '8em'}}
          house={house}
          onChange={this.onHouseChanged} />
        <SimpleFilterSelect
          style={{...styles.select, width: '8em'}}
          placeholder="Level..."
          value={tier}
          onChange={this.onTierChanged}
          options={nullOption.concat(possibleTiers.map(value => {
            return { value, label: `Level ${value}` };
          }))} />
        <SimpleFilterSelect
          style={styles.select}
          placeholder="Trigger..."
          value={trigger}
          onChange={this.onTriggerChanged}
          options={nullOption.concat(possibleTriggers.map(value => {
            return { value, label: `${value} trigger` };
          }))} />
        <div style={styles.textBar}>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            {this.renderExperienceGaps(filteredStudents)}
            {this.renderSSTGaps(filteredStudents)}
          </div>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            {this.renderStats(filteredStudents)}
            <div style={styles.tieringInfo}>Last 45 days</div>
          </div>
        </div>
      </FilterBar>
    );
  }

  renderSystemsAndSupportsLink() {
    const {systemsAndSupportsUrl} = this.props;
    return <a href={systemsAndSupportsUrl} target="_blank">Open SHS Systems and Supports doc</a>;
  }

  renderExperienceGaps(filteredStudents) {
    const uncoveredStudents = filteredStudents.filter(student => (student.grade === '9' || student.grade === '10') && hasAcademicTrigger(student) && !student.notes.last_experience_note.event_note_type_id);
    return (
      <HelpBubble
        modalStyle={styles.modalFullScreen}
        style={{display: 'inline-block', marginLeft: 0}}
        linkStyle={styles.summary}
        dialogStyle={dialogFullScreenFlex}
        withoutSpacer={true}
        withoutContentWrapper={true}
        teaser="NGE/10GE"
        title="Students not yet mentioned in NGE/10GE"
        content={
          <SupportGaps
            message={this.renderSupportGapsMessageWithFilterWarning(
              <div>There are <b>{uncoveredStudents.length} students</b> with academic triggers recently who haven't been mentioned in NGE or 10GE.</div>
            )}
            systemsAndSupports={this.renderSystemsAndSupportsLink()}
            uncoveredStudentsWithTiering={uncoveredStudents}
          />
        }
      />
    );
  }
  
  renderSSTGaps(filteredStudents) {
    const uncoveredStudents = filteredStudents.filter(student => (hasAbsenceTrigger(student) || hasDisciplineTrigger(student)) && !student.notes.last_sst_note.event_note_type_id);
    return (
      <HelpBubble
        modalStyle={styles.modalFullScreen}
        style={{display: 'inline-block', marginLeft: 0}}
        linkStyle={styles.summary}
        dialogStyle={dialogFullScreenFlex}
        withoutSpacer={true}
        withoutContentWrapper={true}
        teaser="SST"
        title="Students not yet mentioned in SST"
        content={
          <SupportGaps
            message={this.renderSupportGapsMessageWithFilterWarning(
              <div>There are <b>{uncoveredStudents.length} students</b> with absence or discipline triggers recently who haven't been mentioned in SST.</div>
            )}
            systemsAndSupports={this.renderSystemsAndSupportsLink()}
            uncoveredStudentsWithTiering={uncoveredStudents}
          />
        }
      />
    );
  }

  renderSupportGapsMessageWithFilterWarning(message) {
    return (
      <div>
        <div>{message}</div>
        {!_.isEqual(initialState(), this.state) && <div style={{color: 'darkorange', fontWeight: 'bold'}}>Filters are applied.</div>}
      </div>
    );
  }

  renderStats(filteredStudents) {
    return (
      <HelpBubble
        modalStyle={modalFromRight}
        style={{display: 'inline-block', margin: 0}}
        linkStyle={{...styles.summary, padding: 0}}
        teaser="Stats"
        title="Stats"
        content={this.renderSummary(filteredStudents)}
      />
    );
  }

  renderSummary(studentsWithTiering) {
    return (
      <div>
        {this.renderSystemsAndSupportsLink()}
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
            {this.renderServiceCount(studentsWithTiering, 'Study skills', STUDY_SKILLS)}
          </div>
        </div>
      </div>
    );
  }

  renderUnlabeledCourses(studentsWithTiering) {
    const assignments = _.flatten(studentsWithTiering.map(s => s.student_section_assignments_right_now));
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
      return firstMatch(s.student_section_assignments_right_now, patterns) !== undefined;
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
    return (
      <div style={{...styles.tableContainer, ...styles.flexVertical}}>
        <StudentLevelsTable studentsWithTiering={studentsWithTiering} />
      </div>
    );
  }
}
TieringView.propTypes = {
  systemsAndSupportsUrl: PropTypes.string.isRequired,
  studentsWithTiering: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    grade: PropTypes.string.isRequired,
    house: PropTypes.string,
    program_assigned: PropTypes.string,
    sped_placement: PropTypes.string,
    student_section_assignments_right_now: PropTypes.arrayOf(PropTypes.shape({
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
  filterBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10
  },
  search: {
    display: 'inline-block',
    padding: 8,
    paddingLeft: 10,
    borderRadius: 3,
    border: '1px solid #ddd',
    marginLeft: 10,
    fontSize: 12,
    width: 150
  },
  select: {
    width: '10em',
    fontSize: 12,
    marginLeft: 15
  },
  summaryContainer: {
    display: 'flex',
    margin: 10,
    fontSize: 14
  },
  summaryColumn: {
    flex: 1,
    margin: 10
  },
  tieringInfo: {
    fontSize: 12,
    color: '#666'
  },
  tableContainer: {
    marginLeft: 10,
    marginTop: 20
  },
  summary: {
    padding: 5,
    fontSize: 12
  },
  modalFullScreen: {
    content: {
      display: 'flex',
      flexDirection: 'column',
      top: 40,
      bottom: 40,
      left: 40,
      right: 40
    }
  },
  textBar: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight: 30 // for download button
  }
};

function initialState() {
  return {
    search: '',
    grade: ALL,
    englishProficiency: ALL,
    house: ALL,
    tier: ALL,
    trigger: ALL
  };
}


function hasAcademicTrigger(student) {
  return student.tier.triggers.indexOf('academic') !== -1;
}

function hasDisciplineTrigger(student) {
  return student.tier.triggers.indexOf('discipline') !== -1;
}

function hasAbsenceTrigger(student) {
  return student.tier.triggers.indexOf('absence') !== -1;
}
