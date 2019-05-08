import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {updateGlobalStylesToTakeFullHeight} from '../helpers/globalStylingWorkarounds';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import HighchartsWrapper from '../components/HighchartsWrapper';
import {gradeText} from '../helpers/gradeText';
import {orderedFAndPLevels} from '../reading/readingData';


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
      benchmarkAssessmentKey: 'f_and_p_english'
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
      return (benchmarkAssessmentKey === null || benchmarkAssessmentKey === d.benchmark_assessment_key);
    });
    const groups = _.groupBy(filteredDataPoints, d => {
      const student = studentsById[d.student_id];
      return [
        d.benchmark_school_year,
        d.benchmark_period_key,
        student.grade,
      ].join('-');
    });

    const years = [2016, 2017, 2018, 2019];
    const periods = ['fall', 'winter', 'spring'];
    const intervals = _.flatMap(years, year => periods.map(period => [year, period]));
    const grades = ['KF', '1', '2'];
    return (
      <div>
        <Scatterplot
          intervals={intervals}
          dataPoints={filteredDataPoints}
          studentsById={studentsById}
        />
        <table>
          <thead>
            <tr>
              <th>Grade</th>
              {intervals.map(interval => {
                const [year, period] = interval;
                return (
                  <th key={interval.join('-')}>
                    <div>{year}</div>
                    <div>{period}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {grades.map(grade => (  
              <tr key={grade}>
                <td>{gradeText(grade)}</td>
                {intervals.map(interval => {
                  const [year, period] = interval;
                  const key = [year, period, grade].join('-');
                  const intervalDataPoints = groups[key] || [];
                  return (
                    <td key={interval.join('-')}>
                      <div title={JSON.stringify(intervalDataPoints, null, 2)}>
                        {intervalDataPoints.length}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <pre>{JSON.stringify(groups, null, 2)}</pre>
      </div>
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


function Scatterplot(props) {
  const {intervals, dataPoints, studentsById} = props;
  const seriesData = dataPoints.map(d => {
    return {
      ...d,
      student: studentsById[d.student_id]
    };
  });
  const levels = orderedFAndPLevels();
  const categories = intervals.map((interval, index) => {
    const category = interval.join('-');
    const y = index;
    const color = 'red';
    return {category, y, color};
  });
  // const props = {
  //   id: "String",
  //   animation: false,
  //   categories: {categories},
  //   seriesData: seriesData,
  //   measureText: 'level',
  //   tooltip: {
  //     pointFormat: 'Total incidents: <b>{point.y}</b>'
  //   }
  // };
  return (
    <div className="Scatterplot">
      <HighchartsWrapper
        style={{flex: 1}}
        chart={{
          type: 'scatter',
          alignTicks: false
        }}
        credits={false}
        xAxis={{
          ...categories,
          gridLineWidth: 1
        }}
        plotOptions={{
          series: {
            animation: false,
            marker: {
              radius: 12,
              fillColor: 'rgba(124, 181, 236, 0.5)'
            }
          }
        }}
        title="title!"
        yAxis={[{
          min: 420, //7 AM
          max: 960, //3 PM plus a gutter category
          reversed: true,
          showLastLabel: false,
          tickInterval: 60,
          title: {text: "level"},
          // labels: {formatter: this.hourFormatter},
          // plotBands: [{
          //   color: 'rgba(241, 254, 198, 0.5)',
          //   from: 900,
          //   to: 960,
          // }]
        },
        {
          // min: 420, //7 AM
          // max: 960, //3 PM plus a gutter category
          gridLineWidth: 0,
          linkedTo: 0,
          opposite: true,
          reversed: true,
          // tickPositions: [930],
          // labels: {formatter: this.gutterFormatter},
          // title: {text: undefined}
        }]}
        // tooltip={{formatter: this.props.toolTipFormatter}}
        series={[
          {
            showInLegend: false,
            data: seriesData
          }
        ]} />
    </div>
  );
}