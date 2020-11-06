import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {SortDirection} from 'react-virtualized';
import ReactModal from 'react-modal';
import EscapeListener from '../components/EscapeListener';
import DownloadIcon from '../components/DownloadIcon';
import FilterBar from '../components/FilterBar';
import SimpleFilterSelect, {ALL} from '../components/SimpleFilterSelect';
import SelectGrade from '../components/SelectGrade';
import SelectHouse from '../components/SelectHouse';
import SelectCounselor from '../components/SelectCounselor';
import SelectEnglishProficiency from '../components/SelectEnglishProficiency';
import StudentConnectionsTable, {
  orderedStudents,
  describeColumns
} from './StudentConnectionsTable';

// UI for Connections page. This is taken from the Levels Page as a baseline
// and may change depending on feedback. Contains filter and button bar as
// well as a table of students. This components tracks state for the sorting
// and filtering within table, so that it can re-use that in the button
// bar to export as a CSV. *** TODO IS CSV EXPORT DESIREABLE/NECESSARY FOR THIS COMPONANT?
export default class ConnectionsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState();

    this.onEscape = this.onEscape.bind(this);
    this.onGradeChanged = this.onGradeChanged.bind(this);
    this.onEnglishProficiencyChanged = this.onEnglishProficiencyChanged.bind(this);
    this.onHouseChanged = this.onHouseChanged.bind(this);
    this.onCounselorChanged = this.onCounselorChanged.bind(this);
    this.onSearchChanged = this.onSearchChanged.bind(this);
    this.onTableSort = this.onTableSort.bind(this);
    this.onDownloadDialogToggled = this.onDownloadDialogToggled.bind(this);
  }

  areFiltersApplied() {
    const {studentsWith2020Surveys} = this.props;
    return (this.filteredStudents().length !== studentsWith2020Surveys.length);
  }

  filteredStudents() {
    const {studentsWith2020Surveys} = this.props;
    const {grade, counselor, house, englishProficiency, search} = this.state;
    return studentsWith2020Surveys.filter(s => {
      if (grade !== ALL && s.grade !== grade) return false;
      if (englishProficiency !== ALL && s.limited_english_proficiency !== englishProficiency) return false;
      if (house !== ALL && s.house !== house) return false;
      if (counselor !== ALL && s.counselor !== counselor) return false;

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

  // So that this list doesn't change with filtering
  allCounselorsSorted() {
    const {studentsWith2020Surveys} = this.props;
    return _.sortBy(_.uniq(_.compact(studentsWith2020Surveys.map(student => student.counselor))));
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

  onCounselorChanged(counselor) {
    this.setState({counselor}); 
  }

  render() {
    const filteredStudents = this.orderedStudents(this.filteredStudents());
    return (
      <EscapeListener className="ConnectionsView" style={{...styles.root, ...styles.flexVertical}} onEscape={this.onEscape}>
        {this.renderSelection(filteredStudents)}
        {this.renderTable(filteredStudents)}
      </EscapeListener>
    );
  }

  renderSelection(filteredStudents) {
    const {grade, house, counselor, englishProficiency, search} = this.state;

    const nullOption = [{ value: ALL, label: 'All' }];
    return (
      <FilterBar style={styles.filterBar} barStyle={{flex: 1}} labelText="Filter">
        <input
          style={styles.search}
          placeholder={`Search ${filteredStudents.length} students...`}
          value={search}
          onChange={this.onSearchChanged} />
        <SelectEnglishProficiency
          style={{...styles.select, width: '9em'}}
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
        <SelectCounselor
          style={{...styles.select, width: '9em'}}
          counselor={counselor}
          counselors={this.allCounselorsSorted()}
          onChange={this.onCounselorChanged} />
        <div style={styles.textBar}>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <div style={styles.timePeriodText}>Last 45 days</div>
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


  // This tracks the modal state on its own rather than using <HelpBubble /> so that it
  // can be lazy about rendering the actual download link (which is expensive) and defer that
  // until the user expresses intent to download.  This adds an extra UX step to the download to do that.
  renderDownloadLink(students) {
    const {nowFn} = this.context;
    const nowMoment = nowFn();
    const columns = describeColumns(nowMoment, {csv: true});
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
          : <DownloadIcon />
        }
      </div>
    );
  }

  renderTable(orderedStudentsWith2020Surveys) {
    const {sortBy, sortDirection} = this.state;
    return (
      <div style={{...styles.tableContainer, ...styles.flexVertical}}>
        <StudentConnectionsTable
          orderedStudentsWith2020Surveys={orderedStudentsWith2020Surveys}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onTableSort={this.onTableSort}
        />
      </div>
    );
  }
}
ConnectionsView.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
ConnectionsView.propTypes = {
  studentsWith2020Surveys: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    grade: PropTypes.string.isRequired,
    house: PropTypes.string,
    counselor: PropTypes.string,
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
    paddingRight: 10
  },
  search: {
    display: 'inline-block',
    padding: 8,
    paddingLeft: 10,
    borderRadius: 3,
    border: '1px solid #ddd',
    marginLeft: 10,
    fontSize: 12,
    width: 140
  },
  select: {
    width: '8em',
    fontSize: 12,
    marginLeft: 10
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
    counselor: ALL,
    sortBy: 'grade',
    sortDirection: SortDirection.ASC,
    isDownloadOpen: false
  };
}

