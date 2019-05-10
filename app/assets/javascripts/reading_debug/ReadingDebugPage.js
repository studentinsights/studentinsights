import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Table, Column, AutoSizer} from 'react-virtualized';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {updateGlobalStylesToTakeFullHeight} from '../helpers/globalStylingWorkarounds';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import ExperimentalBanner from '../components/ExperimentalBanner';
import StudentPhotoCropped from '../components/StudentPhotoCropped';
import {gradeText} from '../helpers/gradeText';
import {classifyFAndPEnglish, interpretFAndPEnglish} from '../reading/readingData';
import FountasAndPinellBreakdown from '../reading/FountasAndPinellBreakdown';
import {
  high,
  medium,
  low,
  missing
} from '../helpers/colors';

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
        <ExperimentalBanner />
        <SectionHeading>Benchmark Reading Data (DEBUG)</SectionHeading>
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
      benchmarkAssessmentKey: 'f_and_p_english',
      selection: null
    };

    this.renderName = this.renderName.bind(this);
  }

  onCellClicked(selection) {
    this.setState({selection});
  }

  render() {
    return (
      <div style={{...styles.flexVertical, margin: 10}}>
        {this.renderList()}
        <div style={{
          flex: 1,
          marginTop: 10,
          borderTop: '1px solid #ccc',
          paddingTop: 10}}>{this.renderTable()}</div>
      </div>
    );
  }

  renderList() {
    const {students, readingBenchmarkDataPoints} = this.props;
    const {benchmarkAssessmentKey, selection} = this.state;
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

    // const years = [2017, 2018, 2019];
    // const periods = ['fall', 'winter', 'spring'];
    // const intervals = _.flatMap(years, year => periods.map(period => [year, period]));
    const intervals = [
      [2017, 'winter'],
      [2017, 'spring'],
      [2018, 'fall'],
      [2018, 'winter'],
      [2018, 'spring'],
      [2019, 'fall'],
      [2019, 'winter']
    ];
    const grades = ['KF', '1', '2'];
    return (
      <div>
        <table style={{width: '100%'}}>
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
                  const fAndPValuesWithNulls = intervalDataPoints.map(dataPoint => dataPoint.json.value);
                  return (
                    <td
                      key={interval.join('-')}>
                      <div 
                        style={_.isEqual(selection, {year, period, grade})
                          ? {cursor: 'pointer', padding: 10, border: `2px solid ${selection}`}
                          : {cursor: 'pointer', padding: 10, border: `2px solid white`}
                        }
                        onClick={this.onCellClicked.bind(this, {year, period, grade})}>
                        <FountasAndPinellBreakdown
                          grade={grade}
                          benchmarkPeriodKey={period}
                          fAndPValuesWithNulls={fAndPValuesWithNulls}
                          includeMissing={true}
                          height={5}
                          labelTop={5}
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  renderTable() {
    const {students, readingBenchmarkDataPoints} = this.props;
    const {benchmarkAssessmentKey, selection} = this.state;
    if (selection === null) {
      return <div style={{fontSize: 14}}>Click a cell to see the list of students.</div>;
    }

    if (!selection) return null;

    const {year, period, grade} = selection;
    const dataPointsByStudentId = {};
    readingBenchmarkDataPoints.forEach(d => {
      if (benchmarkAssessmentKey !== null && benchmarkAssessmentKey !== d.benchmark_assessment_key) return;
      if (d.benchmark_school_year !== year) return;
      if (d.benchmark_period_key !== period) return;
      dataPointsByStudentId[d.student_id] = (dataPointsByStudentId[d.student_id] || []).concat(d);
    });

    const filteredStudents = students.filter(student => {
      if (!dataPointsByStudentId[student.id]) return false;
      if (dataPointsByStudentId.length === 0) return false;
      if (student.grade !== grade) return false;
      return true;
    });

    const rowHeight = 40; // for two lines of student names
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
            rowCount={filteredStudents.length}
            rowGetter={({index}) => filteredStudents[index]}
            >
              <Column
                label='Name'
                dataKey='name'
                cellRenderer={this.renderName}
                width={260}
              />
              <Column
                label='Grade'
                dataKey='grade'
                width={100}
              />
              <Column
                label='F&P level'
                dataKey='f_and_p_english'
                cellRenderer={this.renderFAndP.bind(this, dataPointsByStudentId, period)}
                width={100}
              />
          </Table>
        )}
      </AutoSizer>
    );
  }

  renderName(cellProps) {
    const student = cellProps.rowData;
    return (
      <div style={styles.nameBlock}>
        <a style={{fontSize: 14}} href={`/students/${student.id}`} target="_blank" rel="noopener noreferrer">{student.first_name} {student.last_name}</a>
        {student.has_photo && (
          <StudentPhotoCropped
            studentId={student.id}
            style={styles.photo}
          />
        )}
      </div>
    );
  }

  renderFAndP(dataPointsByStudentId, benchmarkPeriodKey, cellProps) {
    const student = cellProps.rowData;
    const dataPoints = dataPointsByStudentId[student.id] || [];
    if (dataPoints.length === 0) return null;

    return (
      <div>
        {dataPoints.map(d => (
          <div key={d.id}>
            {renderFAndPLevel(d.json.value, student.grade, benchmarkPeriodKey)}
          </div>
        ))}
      </div>
    );
  }
}
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


function renderFAndPLevel(text, grade, benchmarkPeriodKey) {
  if (!text) return none();
  const level = interpretFAndPEnglish(text);
  if (!level) return none();

  // return <div>{level}</div>;
  const category = classifyFAndPEnglish(level, grade, benchmarkPeriodKey);
  const color = {
    high,
    medium,
    low
  }[category] || missing;
  return (
    <div style={{paddingLeft: 5, display: 'flex', flexDirection: 'row'}}>
      <div style={{display: 'inline-block', marginRight: 5}}>
        {coloredBadge(level, color)}
      </div>
    </div>
  );
}

function none() {
  return <span style={{paddingLeft: 5}}>(none)</span>;
}


function coloredBadge(value, color) {
  return (
    <div style={{
      display: 'flex',
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontSize: 14,
      backgroundColor: color
    }}>{value}</div>
  );
}
