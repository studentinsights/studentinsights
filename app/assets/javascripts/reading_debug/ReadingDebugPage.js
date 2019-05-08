import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Table, Column, AutoSizer} from 'react-virtualized';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {gradeText} from '../helpers/gradeText';
import {updateGlobalStylesToTakeFullHeight} from '../helpers/globalStylingWorkarounds';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import FilterBar from '../components/FilterBar';
import SelectHomeroomByEducator from '../components/SelectHomeroomByEducator';
import {ALL} from '../components/SimpleFilterSelect';
import {describeEntryColumns, sortFnsMap} from './entryColumns';
import DocumentContext from './DocumentContext';
import Sortable from './Sortable';


// For reviewing, debugging and developing new ways to make use of
// or revise reading data.
export default class ReadingDebugPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  componentDidMount() {
    updateGlobalStylesToTakeFullHeight();
  }

  fetchJson() {
    return apiFetchJson('/api/reading/reading_debug_json');
  }

  render() {
    return (
      <div className="ReadingDebugPage" style={styles.flexVertical}>
        <GenericLoader
          promiseFn={this.fetchJson}
          style={styles.flexVertical}
          render={this.renderJson} />
      </div>
    );
  }

  renderJson(json) {
    return (
      <ReadingDebugView
        students={json.students}
        readingBenchmarkDataPoints={json.reading_benchmark_data_points}
      />
    );
  }
}


export class ReadingDebugView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      benchmarkAssessmentKey: null
    };
  }

  render() {
    return (
      <div style={{...styles.flexVertical, margin: 10}}>
        <SectionHeading>Benchmark Reading Data (DEBUG)</SectionHeading>
        {this.renderList()}
      </div>
    );
  }

  renderList() {
    const {students, readingBenchmarkDataPoints} = this.props;
    const {benchmarkAssessmentKey} = this.state;
    const studentsById = students.reduce((map, student) => {
      return {...map, [student.id]: student};
    }, {});
    const filteredDataPoints = readingBenchmarkDataPoints.filter(d => {
      return (readingBenchmarkDataPoints === null || benchmarkAssessmentKey === d.benchmark_assessment_key);
    });
    const groups = _.groupBy(filteredDataPoints, d => {
      const student = studentsById[d.student_id];
      return [
        d.benchmark_school_year,
        d.benchmark_period_key,
        student.grade,
      ];
    });

    const years = [2016, 2017, 2018, 2019];
    const periods = ['fall', 'winter', 'spring'];
    const intervals = _.flatMap(years, year => periods.map(period => [year, period]));
    const grades = ['KF', '1', '2'];
    return (
      <table>
        <tbody>
          {grades.map(grade => (  
            <tr key={grade}>
              {intervals.map(interval => {
                const [year, period] = interval;
                return (
                  <td key={interval.join('-')}>
                    <div>{year} /  {period}</div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // renderFilters() {
  //   return (
  //     <FilterBar labelText="Filter by" style={{margin: 10}}>
  //       {this.renderSearch()}
  //       {this.renderHomeroom()}
  //     </FilterBar>
  //   );
  // }

  // renderSearch() {
  //   const {searchText} = this.state;
  //   return (
  //     <input
  //       style={styles.search}
  //       placeholder={`Name...`}
  //       value={searchText}
  //       onChange={this.onSearchChanged} />
  //   );
  // }

  // renderHomeroom() {
  //   const {readingStudents} = this.props;
  //   const {homeroomId} = this.state;
  //   const homerooms = _.uniqBy(readingStudents.map(s => s.homeroom), 'id');
  //   return (
  //     <SelectHomeroomByEducator
  //       placeholder={`Homeroom...`}
  //       homerooms={homerooms}
  //       homeroomId={homeroomId}
  //       onChange={this.onHomeroomChanged} />
  //   );
  // }

  // renderTable(students, columns, doc) {
  //   const {districtKey, nowFn} = this.context;
  //   const nowMoment = nowFn();
  //   const rowHeight = 40; // for two lines of student names

  //   // In conjuction with the filtering, this can lead to a warning in development.
  //   // See https://github.com/bvaughn/react-virtualized/issues/1119 for more.
  //   return (
  //     <AutoSizer style={{marginTop: 20, margin: 10}}>
  //       {({width, height}) => (
  //         <Sortable>
  //           {({sortDirection, sortBy, ordered, onTableSort}) => {
  //             const sortFns = sortFnsMap(doc, districtKey, nowMoment);
  //             const sortedStudents = ordered(this.filteredStudents(students), sortFns);
  //             return (
  //               <Table
  //                 width={width}
  //                 height={height}
  //                 headerHeight={rowHeight}
  //                 headerStyle={{display: 'flex', fontWeight: 'bold', cursor: 'pointer'}}
  //                 rowStyle={{display: 'flex'}}
  //                 style={{fontSize: 14}}
  //                 rowHeight={rowHeight}
  //                 rowCount={sortedStudents.length}
  //                 rowGetter={({index}) => sortedStudents[index]}
  //                 sort={onTableSort}
  //                 sortBy={sortBy}
  //                 sortDirection={sortDirection}
  //                 >{columns.map(column => (
  //                   <Column
  //                     key={column.dataKey}
  //                     headerRenderer={this.renderHeaderCell}
  //                     {...column}
  //                   />
  //                 ))}
  //               </Table>
  //             );
  //           }}
  //         </Sortable>
  //       )}
  //     </AutoSizer>
  //   );
  // }
}
ReadingDebugView.contextTypes = {
  districtKey: PropTypes.string.isRequired,
  nowFn: PropTypes.func.isRequired
};
ReadingDebugView.propTypes = {
  readingBenchmarkDataPoints: PropTypes.arrayOf(PropTypes.shape({
    benchmark_school_year: PropTypes.number.isRequired,
    benchmark_period_key: PropTypes.string.isRequired,
    benchmark_assessment_key: PropTypes.string.isRequired,
    json: PropTypes.object.isRequired
  })).isRequired,
  students: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    grade: PropTypes.string.isRequired,
    plan_504: PropTypes.string,
    access: PropTypes.object,
    ell_transition_date: PropTypes.string,
    latest_iep_document: PropTypes.object,
    limited_english_proficiency: PropTypes.string,
    homeroom: PropTypes.object,
  })).isRequired,
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
