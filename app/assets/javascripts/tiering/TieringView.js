import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {SortDirection} from 'react-virtualized';
import ReactModal from 'react-modal';
import {toCsvTextFromTable} from '../helpers/toCsvFromTable';
import DownloadCsvLink from '../components/DownloadCsvLink';
import EscapeListener from '../components/EscapeListener';
import FilterBar from '../components/FilterBar';
import SimpleFilterSelect, {ALL} from '../components/SimpleFilterSelect';
import SelectGrade from '../components/SelectGrade';
import SelectHouse from '../components/SelectHouse';
import SelectEnglishProficiency from '../components/SelectEnglishProficiency';
import HelpBubble, {modalFromRight} from '../components/HelpBubble';
import StudentLevelsTable, {
  orderedStudents,
  describeColumns
} from './StudentLevelsTable';
import {
  firstMatch,
  CREDIT_RECOVERY,
  ACADEMIC_SUPPORT,
  REDIRECT,
  STUDY_SKILLS
} from './Courses';


// UI for HS tiering prototype.  Contains a filter and button bar,
// and a table of students.  This components tracks state for the sorting
// and filtering within table, so that it can re-use that in the button
// bar to export as a CSV.
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
    this.onTableSort = this.onTableSort.bind(this);
    this.onDownloadDialogToggled = this.onDownloadDialogToggled.bind(this);
  }

  filteredStudents() {
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

  orderedStudents(filteredStudents) {
    const {sortBy, sortDirection} = this.state;
    return orderedStudents(filteredStudents, sortBy, sortDirection);
  }

  onTableSort({sortBy, sortDirection}) {
    this.setState({sortBy, sortDirection});
  }

  onDownloadDialogToggled() {
    const {isDownloadOpen} = this.state;
    this.setState({isDownloadOpen: !isDownloadOpen});
  }

  onEscape() {
    this.setState(initialState());
  }

  onSearchChanged(e) {
    const search = e.target.value;
    this.setState({search});
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

  render() {
    const filteredStudents = this.orderedStudents(this.filteredStudents());
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
            <div style={styles.tieringInfo}>Last 45 days</div>
            {this.renderStats(filteredStudents)}
          </div>
          <div style={{display: 'flex', flexDirection: 'column', paddingLeft: 10}}>
            {this.renderDownloadLink(filteredStudents)}
          </div>
        </div>
      </FilterBar>
    );
  }

  renderSystemsAndSupportsLink() {
    const {systemsAndSupportsUrl, sourceCodeUrl} = this.props;
    return (
      <div>
        <a style={{display: 'block'}} href={systemsAndSupportsUrl} target="_blank">Open SHS Systems and Supports doc</a>
        <a style={{display: 'block'}} href={sourceCodeUrl} target="_blank">Open source code</a>
      </div>
    );
  }

  //<div>There are <b>{uncoveredStudents.length} students</b> with absence or discipline triggers recently who haven't been mentioned in SST.</div>
  // renderSupportGapsMessageWithFilterWarning(message) {
  //   return (
  //     <div>
  //       <div>{message}</div>
  //       {!_.isEqual(initialState(), this.state) && <div style={{color: 'darkorange', fontWeight: 'bold'}}>Filters are applied.</div>}
  //     </div>
  //   );
  // }

  renderStats(filteredStudents) {
    return (
      <HelpBubble
        modalStyle={modalFromRight}
        style={{display: 'inline-block', margin: 0}}
        linkStyle={{...styles.summary, padding: 0}}
        teaser="Breakdown"
        title="Breakdown"
        content={this.renderBreakdown(filteredStudents)}
      />
    );
  }

  renderBreakdown(studentsWithTiering) {
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

  // Unused, but for internal debugging
  // renderUnlabeledCourses(studentsWithTiering) {
  //   const assignments = _.flatten(studentsWithTiering.map(s => s.student_section_assignments_right_now));
  //   const labeledAssignments = assignments.map(assignment => {
  //     return {
  //       ...assignment,
  //       departmentKey: labelDepartmentKey(assignment)
  //     };
  //   });

  //   const unlabeledCourses = _.uniq(labeledAssignments
  //     .filter(a => a.departmentKey === 'unknown')
  //     .map(a => a.section.course_description));

  //   return <pre>{JSON.stringify(unlabeledCourses(studentsWithTiering), null, 2)}</pre>;
  // }

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

  renderSummaryBit(labelText, count, percentage) {
    return (
      <div key={labelText}>
        <div><b>{labelText}</b>:</div>
        <div style={{marginLeft: 10, marginBottom: 5}}>{percentage}% ({count} students)</div>
      </div>
    );
  }

  // This tracks the modal state on its own rather than using <HelpBubble /> so that it
  // can be lazy about rendering the actual download link (which is expensive) and defer that
  // until the user expresses intent to download.  This adds an extra UX step to the download to do that.
  renderDownloadLink(students) {
    const {nowFn} = this.context;
    const nowMoment = nowFn();
    const columns = describeColumns(nowMoment);
    const {isDownloadOpen} = this.state;

    return (
      <div onClick={this.onDownloadDialogToggled}>
        {isDownloadOpen
          ? <ReactModal isOpen={true} onRequestClose={this.onDownloadDialogToggled} style={styles.downloadLink}>
              {this.renderLinkWithCsvDataInline(columns, students)}
            </ReactModal>
          : <svg style={{fill: "#3177c9", opacity: 0.5, cursor: 'pointer'}} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
        }
      </div>
    );
  }
  
  // This is expensive to render, since it unrolls the whole spreadsheet into a string
  // and writes it inline to the link.
  renderLinkWithCsvDataInline(columns, students) {
    const csvText = toCsvTextFromTable(columns, students);
    const {nowFn} = this.context;
    const now = nowFn();
    const filename = `SHSLevelsPrototype-${now.format('YYYY-MM-DD')}.csv`;
    return (
      <div style={{fontSize: 14}}>
        <h1 style={{
          borderBottom: '1px solid #333',
          paddingBottom: 10,
          marginBottom: 20
        }}>Export as spreadsheet</h1>
        <div style={{marginBottom: 20}}>This will include data for {students.length} students.</div>
        <DownloadCsvLink filename={filename} style={{color: 'white'}} csvText={csvText}>
          Download CSV
        </DownloadCsvLink>
      </div>
    );
  }

  renderTable(orderedStudentsWithTiering) {
    const {sortBy, sortDirection} = this.state;
    return (
      <div style={{...styles.tableContainer, ...styles.flexVertical}}>
        <StudentLevelsTable
          orderedStudentsWithTiering={orderedStudentsWithTiering}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onTableSort={this.onTableSort}
        />
      </div>
    );
  }
}
TieringView.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
TieringView.propTypes = {
  systemsAndSupportsUrl: PropTypes.string.isRequired,
  sourceCodeUrl: PropTypes.string.isRequired,
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
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20
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
    alignItems: 'center'
  }
};

function initialState() {
  return {
    search: '',
    grade: ALL,
    englishProficiency: ALL,
    house: ALL,
    tier: ALL,
    trigger: ALL,
    sortBy: 'level',
    sortDirection: SortDirection.ASC,
    isDownloadOpen: false
  };
}

