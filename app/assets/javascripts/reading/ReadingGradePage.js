import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ReactModal from 'react-modal';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {rankedByGradeLevel} from '../helpers/SortHelpers';
import {
  hasActive504Plan,
  shouldShowIepLink
} from '../helpers/PerDistrict';
import {
  prettyProgramOrPlacementText,
  prettyIepTextForSpecialEducationStudent,
  hasAnySpecialEducationData
} from '../helpers/specialEducation';
import {isEnglishLearner} from '../helpers/language';
import {updateGlobalStylesToTakeFullHeight} from '../helpers/globalStylingWorkarounds';
import {Table, Column, AutoSizer, SortDirection} from 'react-virtualized';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import {modalFromRight} from '../components/HelpBubble';
import {toCsvTextFromTable} from '../helpers/toCsvFromTable';
import DownloadCsvLink from '../components/DownloadCsvLink';


export default class ReadingGradePage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  // THIS doesn't quite work
  componentDidMount() {
    updateGlobalStylesToTakeFullHeight();
  }

  fetchJson() {
    const {schoolId, grade} = this.props;
    const url = `/api/schools/${schoolId}/reading/${grade}`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="ReadingGradePage" style={styles.flexVertical}>
        <GenericLoader
          promiseFn={this.fetchJson}
          style={styles.flexVertical}
          render={this.renderJson} />
      </div>
    );
  }

  renderJson(json) {
    const {schoolId, grade} = this.props;
    return (
      <ReadingGradePageView
        readingStudents={json.reading_students}
        schoolId={schoolId}
        grade={grade}
      />
    );
  }
}
ReadingGradePage.propTypes ={
  schoolId: PropTypes.string.isRequired,
  grade: PropTypes.string.isRequired
};


export class ReadingGradePageView extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      isDownloadOpen: false,
      sortBy: 'name',
      sortDirection: SortDirection.ASC,
    };
    this.onTableSort = this.onTableSort.bind(this);
    this.onDownloadDialogToggled = this.onDownloadDialogToggled.bind(this);
  }

  orderedStudents(students) {
    const {districtKey} = this.context;
    const {sortBy, sortDirection} = this.state;

    // map dataKey to an accessor/sort function
    const sortFns = {
      fallback(student) { return student[sortBy]; },
      grade(student) { return rankedByGradeLevel(student.grade); },
      name(student) { return `${student.last_name}, ${student.first_name}`; },
      iep(student) { return hasAnySpecialEducationData(student, {}) ? 'IEP' : null; },
      plan_504(student) { return hasActive504Plan(student.plan_504) ? '504' : null; },
      dibels(student) { return latestDibels(student); },
      f_and_p(student) { return latestFAndP(student); },
      star_reading(student) { return latestStar(student); },
    };
    const sortFn = sortFns[sortBy] || sortFns.fallback;
    const sortedRows = _.sortBy(students, sortFn);

    // respect direction
    return (sortDirection == SortDirection.DESC) 
      ? sortedRows.reverse()
      : sortedRows;
  }

  onTableSort({defaultSortDirection, event, sortBy, sortDirection}) {
    if (sortBy === this.state.sortBy) {
      const oppositeSortDirection = (this.state.sortDirection == SortDirection.DESC)
        ? SortDirection.ASC
        : SortDirection.DESC;
      this.setState({ sortDirection: oppositeSortDirection });
    } else {
      this.setState({sortBy});
    }
  }

  onDownloadDialogToggled() {
    const {isDownloadOpen} = this.state;
    this.setState({isDownloadOpen: !isDownloadOpen});
  }

  render() {
    const {readingStudents} = this.props;

    return (
      <div style={{...styles.flexVertical, margin: 10}}>
        <SectionHeading titleStyle={styles.title}>
          <div>Reading: 3rd grade at Arthur D. Healey</div>
          {this.renderDownloadLink(readingStudents)}
        </SectionHeading>
        {this.renderTable(readingStudents)}
      </div>
    );
  }

  renderTable(readingStudents) {
    const {districtKey} = this.context;
    const {sortDirection, sortBy} = this.state;
    const sortedStudents = this.orderedStudents(readingStudents);
    const rowHeight = 40; // for two lines of student names
    const columns = describeColumns(districtKey);

    // In conjuction with the filtering, this can lead to a warning in development.
    // See https://github.com/bvaughn/react-virtualized/issues/1119 for more.
    return (
      <AutoSizer style={{marginTop: 20, margin: 10}}>
        {({width, height}) => (
          <Table
            width={width}
            height={height}
            headerHeight={rowHeight}
            headerStyle={{display: 'flex', fontWeight: 'bold', cursor: 'pointer'}}
            rowStyle={{display: 'flex'}}
            style={{fontSize: 14}}
            rowHeight={rowHeight}
            rowCount={sortedStudents.length}
            rowGetter={({index}) => sortedStudents[index]}
            sort={this.onTableSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            >{columns.map(column => <Column key={column.dataKey} headerRenderer={this.renderHeaderCell} {...column} />)}
          </Table>
        )}
      </AutoSizer>
    );
  }


  // This tracks the modal state on its own rather than using <HelpBubble /> so that it
  // can be lazy about rendering the actual download link (which is expensive) and defer that
  // until the user expresses intent to download.  This adds an extra UX step to the download to do that.
  renderDownloadLink(students) {
    const {districtKey} = this.context;
    const columns = describeColumns(districtKey);
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
    const {nowFn} = this.context;
    const {schoolId, grade} = this.props;
    const now = nowFn();
    const filename = `Reading-${schoolId}-${grade}-${now.format('YYYY-MM-DD')}.csv`;
    const csvText = toCsvTextFromTable(columns, students);
    return (
      <div style={{fontSize: 14}}>
        <h1 style={{
          borderBottom: '1px solid #333',
          paddingBottom: 10,
          marginBottom: 20
        }}>Export as spreadsheet</h1>
        <DownloadCsvLink filename={filename} style={styles.downloadButton} csvText={csvText}>
          Download CSV
        </DownloadCsvLink>
      </div>
    );
  }
}
ReadingGradePageView.contextTypes = {
  districtKey: PropTypes.string.isRequired,
  nowFn: PropTypes.func.isRequired
};
ReadingGradePageView.propTypes = {
  schoolId: PropTypes.string.isRequired,
  grade: PropTypes.string.isRequired,
  readingStudents: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired
  })).isRequired
};


const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  title: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  downloadButton: {
    display: 'inline-block',
    marginBottom: 10,
    color: 'white'
  }
};

// relies on already sorted
function tryLatest(key, list) {
  const obj = _.first(list);
  return obj ? obj[key] : null;
}


function latestDibels(student) {
  return tryLatest('benchmark', student.dibels_results);
}
function latestFAndP(student) {
  return tryLatest('instructional_level', student.f_and_p_assessments);
}
function latestStar(student) {
  return tryLatest('percentile_rank', student.star_reading_results);
}

function describeColumns(districtKey) {
  return [{
    label: 'Name',
    dataKey: 'name',
    cellRenderer: renderName,
    flexGrow: 1,
    width: 200
  }, {
    label: '504',
    dataKey: 'plan_504',
    cellRenderer({rowData}) { return hasActive504Plan(rowData.plan_504) ? '504' : null; },
    width: 80
  }, {
    label: 'IEP',
    dataKey: 'iep',
    cellRenderer({rowData}) { return hasAnySpecialEducationData(rowData, {}) ? 'IEP' : null; },
    width: 80
  }, {
    label: 'English Learner',
    dataKey: 'limited_english_proficiency',
    cellRenderer({rowData}) { return isEnglishLearner(districtKey, rowData.limited_english_proficiency) ? 'ELL' : null; },
    width: 80
  }, {
    label: 'F&P',
    dataKey: 'f_and_p',
    cellRenderer({rowData}) { return latestFAndP(rowData); },
    width: 100
  }, {
    label: 'DIBELS Composite',
    dataKey: 'dibels',
    cellRenderer({rowData}) { return latestDibels(rowData); },
    width: 100
  }, {
    label: 'STAR',
    dataKey: 'star_reading',
    cellRenderer({rowData}) { return latestStar(rowData); },
    width: 100
  }];
}


function renderName(cellProps) {
  const student = cellProps.rowData;
  return <a style={{fontSize: 14}} href={`/students/${student.id}`} target="_blank" rel="noopener noreferrer">{student.first_name} {student.last_name}</a>;
}
