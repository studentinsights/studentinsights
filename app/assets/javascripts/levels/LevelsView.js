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
import LevelsBreakdown from './LevelsBreakdown';
import StudentLevelsTable, {
  orderedStudents,
  describeColumns
} from './StudentLevelsTable';


// UI for HS Levels page.  Contains a filter and button bar,
// and a table of students.  This components tracks state for the sorting
// and filtering within table, so that it can re-use that in the button
// bar to export as a CSV.
export default class LevelsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState();

    this.onEscape = this.onEscape.bind(this);
    this.onGradeChanged = this.onGradeChanged.bind(this);
    this.onEnglishProficiencyChanged = this.onEnglishProficiencyChanged.bind(this);
    this.onHouseChanged = this.onHouseChanged.bind(this);
    this.onLevelChanged = this.onLevelChanged.bind(this);
    this.onTriggerChanged = this.onTriggerChanged.bind(this);
    this.onSearchChanged = this.onSearchChanged.bind(this);
    this.onTableSort = this.onTableSort.bind(this);
    this.onDownloadDialogToggled = this.onDownloadDialogToggled.bind(this);
  }

  areFiltersApplied() {
    const {studentsWithLevels} = this.props;
    return (this.filteredStudents().length !== studentsWithLevels.length);
  }

  filteredStudents() {
    const {studentsWithLevels} = this.props;
    const {grade, house, level, trigger, englishProficiency, search} = this.state;
    return studentsWithLevels.filter(s => {
      if (grade !== ALL && s.grade !== grade) return false;
      if (englishProficiency !== ALL && s.limited_english_proficiency !== englishProficiency) return false;
      if (house !== ALL && s.house !== house) return false;
      if (level !== ALL && s.level.level_number !== parseInt(level, 0)) return false;
      if (trigger !== ALL && s.level.triggers.indexOf(trigger) === -1) return false;
      
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

  onLevelChanged(level) {
    this.setState({level});
  }

  onTriggerChanged(trigger) {
    this.setState({trigger});
  }

  render() {
    const filteredStudents = this.orderedStudents(this.filteredStudents());
    return (
      <EscapeListener className="LevelsView" style={{...styles.root, ...styles.flexVertical}} onEscape={this.onEscape}>
        {this.renderSelection(filteredStudents)}
        {this.renderTable(filteredStudents)}
      </EscapeListener>
    );
  }

  renderSelection(filteredStudents) {
    const {grade, house, englishProficiency, level, trigger, search} = this.state;

    const nullOption = [{ value: ALL, label: 'All' }];
    const possibleLevelNumbers = ['0', '1', '2', '3', '4'];
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
          value={level}
          onChange={this.onLevelChanged}
          options={nullOption.concat(possibleLevelNumbers.map(value => {
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
            <div style={styles.timePeriodText}>Last 45 days</div>
            {this.renderBreakdownLink(filteredStudents)}
          </div>
          <div style={{display: 'flex', flexDirection: 'column', paddingLeft: 10}}>
            {this.renderDownloadLink(filteredStudents)}
          </div>
        </div>
      </FilterBar>
    );
  }

  renderFilterWarningMessage(students) {
    const messageStyles = { marginBottom: 20};
    if (this.areFiltersApplied()) {
      return (
        <div style={{...messageStyles, fontWeight: 'bold', color: 'darkorange'}}>
          Filters are applied, so this only includes data for {students.length} students.
        </div>
      );
    } else {
      return (
        <div style={messageStyles}>
          This includes data for all {students.length} students.
        </div>
      );
    }
  }

  renderBreakdownLink(filteredStudents) {
    return (
      <HelpBubble
        modalStyle={modalFromRight}
        style={{display: 'inline-block', margin: 0}}
        linkStyle={{...styles.summary, padding: 0}}
        teaser="Breakdown"
        title="Breakdown"
        content={
          <LevelsBreakdown
            studentsWithLevels={filteredStudents}
            messageEl={this.renderFilterWarningMessage(filteredStudents)}
            levelsLinksEl={this.renderLevelsLinks()}
          />
        }
      />
    );
  }

  renderLevelsLinks(filteredStudents) {
    const {systemsAndSupportsUrl, sourceCodeUrl} = this.props;
    return (
      <div style={{marginTop: 20}}>
        <a style={{display: 'block'}} href={systemsAndSupportsUrl} target="_blank">Open SHS Systems and Supports doc</a>
        <a style={{display: 'block'}} href={sourceCodeUrl} target="_blank">Open source code</a>
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
          ? <ReactModal
              isOpen={true}
              onRequestClose={this.onDownloadDialogToggled}
              style={modalFromRight}>
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
        {this.renderFilterWarningMessage(students)}
        <DownloadCsvLink filename={filename} style={styles.downloadButton} csvText={csvText}>
          Download CSV
        </DownloadCsvLink>
      </div>
    );
  }

  renderTable(orderedStudentsWithLevels) {
    const {sortBy, sortDirection} = this.state;
    return (
      <div style={{...styles.tableContainer, ...styles.flexVertical}}>
        <StudentLevelsTable
          orderedStudentsWithLevels={orderedStudentsWithLevels}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onTableSort={this.onTableSort}
        />
      </div>
    );
  }
}
LevelsView.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
LevelsView.propTypes = {
  systemsAndSupportsUrl: PropTypes.string.isRequired,
  sourceCodeUrl: PropTypes.string.isRequired,
  studentsWithLevels: PropTypes.arrayOf(PropTypes.shape({
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
  timePeriodText: {
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
  },
  downloadButton: {
    display: 'inline-block',
    marginBottom: 10,
    color: 'white'
  }
};

function initialState() {
  return {
    search: '',
    grade: ALL,
    englishProficiency: ALL,
    house: ALL,
    level: ALL,
    trigger: ALL,
    sortBy: 'level',
    sortDirection: SortDirection.ASC,
    isDownloadOpen: false
  };
}

