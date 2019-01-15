import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Table, Column, AutoSizer} from 'react-virtualized';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {gradeText} from '../helpers/gradeText';
import {toCsvTextFromTable} from '../helpers/toCsvFromTable';
import {updateGlobalStylesToTakeFullHeight} from '../helpers/globalStylingWorkarounds';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import FilterBar from '../components/FilterBar';
import SelectHomeroomByEducator from '../components/SelectHomeroomByEducator';
import {ALL} from '../components/SimpleFilterSelect';
import {describeEntryColumns, sortFnsMap} from './entryColumns';
import DocumentContext from './DocumentContext';
import Sortable from './Sortable';
import LazyExportLink from './LazyExportLink';


export default class ReadingEntryPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  componentDidMount() {
    updateGlobalStylesToTakeFullHeight();
  }

  fetchJson() {
    const {schoolSlug, grade} = this.props;
    const url = `/api/schools/${schoolSlug}/reading/${grade}/reading_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="ReadingEntryPage" style={styles.flexVertical}>
        <GenericLoader
          promiseFn={this.fetchJson}
          style={styles.flexVertical}
          render={this.renderJson} />
      </div>
    );
  }

  renderJson(json) {
    const {currentEducatorId, grade} = this.props;
    return (
      <ReadingEntryPageView
        currentEducatorId={currentEducatorId}
        grade={grade}
        school={json.school}
        readingStudents={json.reading_students}
        mtssNotes={json.latest_mtss_notes}
      />
    );
  }
}
ReadingEntryPage.propTypes = {
  currentEducatorId: PropTypes.number.isRequired,
  schoolSlug: PropTypes.string.isRequired,
  grade: PropTypes.string.isRequired
};


export class ReadingEntryPageView extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      searchText: '',
      homeroomId: ALL
    };
    this.onSearchChanged = this.onSearchChanged.bind(this);
    this.onHomeroomChanged = this.onHomeroomChanged.bind(this);
  }

  filteredStudents(students) {
    const {searchText, homeroomId} = this.state;
    return students.filter(student => {
      if (`${student.first_name} ${student.last_name}`.toLowerCase().indexOf(searchText.toLowerCase()) === -1) return false;
      if (homeroomId !== ALL && student.homeroom.id.toString() !== homeroomId) return false;
      return true;
    });
  }

  withMerged(students) {
    const {mtssNotes} = this.props;
    const mtssByStudentId = _.groupBy(mtssNotes, 'student_id');
    return students.map(student => {
      return {
        ...student,
        mtss: mtssByStudentId[student.id] || []
      };
    });
  }

  exportCsvFn(columns, students) {
    const {nowFn} = this.context;
    const {school, grade} = this.props;
    const now = nowFn();
    const filename = `Reading-${school.slug.toUpperCase()}-${grade}-${now.format('YYYY-MM-DD')}.csv`;
    const csvText = toCsvTextFromTable(columns, students);
    return {csvText, filename};
  }

  onSearchChanged(e) {
    this.setState({searchText: e.target.value});
  }

  onHomeroomChanged(homeroomId) {
    this.setState({homeroomId});
  }

  render() {
    const {districtKey, nowFn} = this.context;    
    const {school, grade, readingStudents, currentEducatorId} = this.props;
    const students = this.withMerged(readingStudents);
    const nowMoment = nowFn();
    return (
      <DocumentContext initialDoc={{}} >
        {({doc, onDocChanged, pending, failed}) => {
          const columns = describeEntryColumns({
            districtKey,
            nowMoment,
            currentEducatorId,
            doc,
            onDocChanged
          });
          return (
            <div style={{...styles.flexVertical, margin: 10}}>
              <SectionHeading titleStyle={styles.title}>
                <div>Benchmark Reading Data: {gradeText(grade)} at {school.name}</div>
                <div style={{display: 'flex'}}>
                  {pending.length > 0 ? '...' : null}
                  {failed.length > 0 ? '!' : null}
                  {this.renderDownloadLink(students, columns)}
                </div>
              </SectionHeading>
              {this.renderFilters()}
              {this.renderTable(students, columns)}
            </div>
          );
        }}
      </DocumentContext>
    );
  }

  renderDownloadLink(students, columns) {
    return <LazyExportLink exportCsvFn={() => this.exportCsvFn(students, columns)} />;
  }

  renderFilters() {
    return (
      <FilterBar labelText="Filter by" style={{margin: 10}}>
        {this.renderSearch()}
        {this.renderHomeroom()}
      </FilterBar>
    );
  }

  renderSearch() {
    const {searchText} = this.state;
    return (
      <input
        style={styles.search}
        placeholder={`Name...`}
        value={searchText}
        onChange={this.onSearchChanged} />
    );
  }

  renderHomeroom() {
    const {readingStudents} = this.props;
    const {homeroomId} = this.state;
    const homerooms = _.uniqBy(readingStudents.map(s => s.homeroom), 'id');
    return (
      <SelectHomeroomByEducator
        placeholder={`Homeroom...`}
        homerooms={homerooms}
        homeroomId={homeroomId}
        onChange={this.onHomeroomChanged} />
    );
  }

  renderTable(students, columns) {
    const {districtKey} = this.context;
    const rowHeight = 40; // for two lines of student names

    // In conjuction with the filtering, this can lead to a warning in development.
    // See https://github.com/bvaughn/react-virtualized/issues/1119 for more.
    return (
      <AutoSizer style={{marginTop: 20, margin: 10}}>
        {({width, height}) => (
          <Sortable>
            {({sortDirection, sortBy, ordered, onTableSort}) => {
              const sortedStudents = ordered(this.filteredStudents(students), sortFnsMap(districtKey));
              return (
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
                  sort={onTableSort}
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  >{columns.map(column => (
                    <Column
                      key={column.dataKey}
                      headerRenderer={this.renderHeaderCell}
                      {...column}
                    />
                  ))}
                </Table>
              );
            }}
          </Sortable>
        )}
      </AutoSizer>
    );
  }
}
ReadingEntryPageView.contextTypes = {
  districtKey: PropTypes.string.isRequired,
  nowFn: PropTypes.func.isRequired
};
ReadingEntryPageView.propTypes = {
  currentEducatorId: PropTypes.number.isRequired,
  grade: PropTypes.string.isRequired,
  school: PropTypes.shape({
    id: PropTypes.number.isRequired,
    slug: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  readingStudents: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    grade: PropTypes.string.isRequired,
    plan_504: PropTypes.string,
    access: PropTypes.object,
    ell_transition_date: PropTypes.string,
    latest_iep_document: PropTypes.object,
    limited_english_proficiency: PropTypes.string,
    homeroom: PropTypes.object.isRequired,
    reading_benchmark_data_points: PropTypes.arrayOf(PropTypes.shape({
      benchmark_assessment_key: PropTypes.string.isRequired,
      benchmark_period_key: PropTypes.string.isRequired,
      benchmark_school_year: PropTypes.number.isRequired,
      json: PropTypes.object.isRequired,
      educator: PropTypes.object.isRequired
    })).isRequired
  })).isRequired,
  mtssNotes: PropTypes.arrayOf(PropTypes.shape({
    student_id: PropTypes.number.isRequired,
    id: PropTypes.number.isRequired,
    recorded_at: PropTypes.string.isRequired,
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
  // Matching react-select
  search: {
    display: 'inline-block',
    padding: '7px 7px 7px 12px',
    borderRadius: 4,
    border: '1px solid #ccc',
    marginLeft: 20,
    marginRight: 10,
    fontSize: 14,
    width: 220
  }
};

