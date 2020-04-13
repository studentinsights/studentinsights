import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import qs from 'query-string';
import {Table, Column, AutoSizer} from 'react-virtualized';
import ReactModal from 'react-modal';
import {shortSchoolName} from '../helpers/PerDistrict';
import {adjustedGrade, gradeText} from '../helpers/gradeText';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {updateGlobalStylesToTakeFullHeight} from '../helpers/globalStylingWorkarounds';
import {
  high,
  medium,
  low,
  missing
} from '../helpers/colors';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import {modalFullScreenWithVerticalScroll} from '../components/HelpBubble';
import SimpleFilterSelect, {ALL} from '../components/SimpleFilterSelect';
import SelectGrade from '../components/SelectGrade';
import SelectSchool from '../components/SelectSchool';
import DownloadIcon from '../components/DownloadIcon';
import ExperimentalBanner from '../components/ExperimentalBanner';
import StudentPhotoCropped from '../components/StudentPhotoCropped';
import DibelsBreakdownBar from '../components/DibelsBreakdownBar';
import BoxAndWhisker from '../components/BoxAndWhisker';
import {classifyFAndPEnglish, interpretFAndPEnglish} from '../reading/fAndPInterpreter';
import FountasAndPinellBreakdown from '../reading/FountasAndPinellBreakdown';
import GradeTimeGrid from './GradeTimeGrid';
import {
  DIBELS_DORF_WPM,
  DIBELS_DORF_ACC,
  DIBELS_DORF_ERRORS,
  DIBELS_FSF,
  DIBELS_LNF,
  DIBELS_PSF,
  DIBELS_NWF_CLS,
  DIBELS_NWF_WWR,
  F_AND_P_ENGLISH,
  F_AND_P_SPANISH,
  INSTRUCTIONAL_NEEDS
} from '../reading/thresholds';
import {
  DIBELS_CORE,
  DIBELS_STRATEGIC,
  DIBELS_INTENSIVE,
  DIBELS_UNKNOWN,
  classifyDibels,
  colorForDibelsCategory,
  interpretDibels,
  rankBenchmarkDataPoint
} from '../reading/readingData';


// For reviewing, debugging and developing new ways to make use of
// or revise reading data.
export default class ReadingDebugPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      schoolIdNow: ALL
    };
    this.url = this.url.bind(this);
    this.onSchoolIdNowChanged = this.onSchoolIdNowChanged.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  componentDidMount() {
    updateGlobalStylesToTakeFullHeight();
  }

  url() {
    const {schoolIdNow} = this.state;
    const queryString = qs.stringify({
      school_id_now: schoolIdNow == ALL ? null : schoolIdNow
    });
    return `/api/reading_debug/reading_debug_json?${queryString}`;
  }

  onSchoolIdNowChanged(schoolIdNow) {
    this.setState({schoolIdNow});
  }

  render() {
    const url = this.url();
    return (
      <div className="ReadingDebugPage" style={styles.flexVertical}>
        <ExperimentalBanner />
        <SectionHeading titleStyle={styles.title}>
          <div>Reading: Benchmark assessment breakdowns</div>
          <a href="/reading/debug_csv"><DownloadIcon /></a>
        </SectionHeading>
        <GenericLoader
          key={url}
          promiseFn={() => apiFetchJson(url)}
          style={styles.flexVertical}
          render={this.renderJson} />
      </div>
    );
  }

  renderJson(json) {
    const {schoolIdNow} = this.state;
    return (
      <ReadingDebugView
        students={json.students}
        groups={json.groups}
        schools={json.schools}
        studentCountsByGrade={json.student_counts_by_grade}
        schoolIdNow={schoolIdNow}
        onSchoolIdNowChanged={this.onSchoolIdNowChanged}
      />
    );
  }
}


export class ReadingDebugView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      benchmarkAssessmentKey: F_AND_P_ENGLISH,
      selection: null,
      visualization: ALL
    };

    this.renderGradeForGrid = this.renderGradeForGrid.bind(this);
    this.renderName = this.renderName.bind(this);
    this.onCellClicked = this.onCellClicked.bind(this);
    this.onBenchmarkAssessmentKeyChanged = this.onBenchmarkAssessmentKeyChanged.bind(this);
    this.onFlippedClicked = this.onFlippedClicked.bind(this);
    this.onVisualizationChanged = this.onVisualizationChanged.bind(this);
  }

  componentWillMount(){
    ReactModal.setAppElement(document.body);
  }

  dataPointsForGroup(selection) {
    const {groups} = this.props;
    const {benchmarkAssessmentKey} = this.state;
    const {year, period, grade} = selection;
    const key = [year, period, grade].join('-');
    return (groups[key] || []).filter(d => {
      if (benchmarkAssessmentKey === null) return true;
      if (benchmarkAssessmentKey === d.benchmark_assessment_key) return true;
      return false;
    });
  }

  onFlippedClicked() {
    const {isFlipped} = this.state;
    this.setState({isFlipped: !isFlipped});
  }

  onCellClicked(selection) {
    this.setState({selection});
  }

  onBenchmarkAssessmentKeyChanged(benchmarkAssessmentKey) {
    this.setState({benchmarkAssessmentKey});
  }

  onVisualizationChanged(visualization) {
    this.setState({visualization});
  }

  render() {
    const {isFlipped, visualization} = this.state;
    return (
      <div style={{...styles.flexVertical, margin: 10}}>
        <div style={{marginTop: 10, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            {this.renderAssessmentSelect()}
            {this.renderSchoolIdNowSelect()}
            <SimpleFilterSelect
              placeholder="Visualization..."
              style={{width: '10em'}}
              value={visualization}
              onChange={this.onVisualizationChanged}
              options={[
                {value: ALL, label: 'Default'},
                {value: 'BOX_AND_WHISKER', label: 'Box and whisker'}
              ]} />
            <div
              style={{
                paddingLeft: 10,
                cursor: 'pointer',
                color: '#333',
                fontSize: 14,
                fontWeight: isFlipped ? 'bold' : 'normal'
              }}
              onClick={this.onFlippedClicked}>Flip table</div>
          </div>
          <div>
            <a target="_blank" rel="noopener noreferrer" href="/reading/homerooms">homerooms</a>
            <a style={{marginLeft: 10}} target="_blank" rel="noopener noreferrer" href="/reading/thresholds">thresholds</a>
          </div>
        </div>
        {this.renderGrid()}
        <div style={{
          flex: 1,
          marginTop: 10,
          borderTop: '1px solid #ccc',
          paddingTop: 10}}>{this.renderTable()}</div>
      </div>
    );
  }

  renderAssessmentSelect() {
    const {benchmarkAssessmentKey} = this.state;

    const options = [
      {value: F_AND_P_ENGLISH, label: 'F&P English'},
      {value: F_AND_P_SPANISH, label: 'F&P Spanish'},
      {value: INSTRUCTIONAL_NEEDS, label: 'Instructional needs'},
      {value: DIBELS_FSF, label: 'FSF, First sound fluency'},
      {value: DIBELS_LNF, label: 'LNF, Letter naming fluency'},
      {value: DIBELS_PSF, label: 'PSF, Phonemic segmentation fluency'},
      {value: DIBELS_NWF_CLS, label: 'NWF-CLS, Nonsense word fluency'},
      {value: DIBELS_NWF_WWR, label: 'NWF-WWR, Nonsense word fluency'},
      {value: DIBELS_DORF_WPM, label: 'ORF words/minute'},
      {value: DIBELS_DORF_ACC, label: 'ORF accuracy'},
      {value: DIBELS_DORF_ERRORS, label: 'ORF errors'}
    ];
    return (
      <SimpleFilterSelect
        style={{width: '20em'}}
        placeholder="Data type..."
        value={benchmarkAssessmentKey}
        onChange={this.onBenchmarkAssessmentKeyChanged}
        options={options} />
    );
  }

  renderSchoolIdNowSelect() {
    const {districtKey} = this.context;
    const {schools, schoolIdNow, onSchoolIdNowChanged} = this.props;
    return (
      <SelectSchool
        style={{width: '10em'}}
        schoolId={schoolIdNow}
        schools={schools.map(school => {
          return {
            id: school.id,
            label: shortSchoolName(districtKey, school.local_id)
          };
        })}
        onChange={onSchoolIdNowChanged} />
    );
  }

  renderGrid() {
    const {groups} = this.props;
    const {selection, isFlipped} = this.state;
    // set manually for now
    const intervals = [
      [2017, 'winter'],
      [2017, 'spring'],
      [2018, 'fall'],
      [2018, 'winter'],
      [2018, 'spring'],
      [2019, 'fall'],
      [2019, 'winter']
    ];
    const grades = ['KF', '1', '2', '3', '4', '5'];

    return (
      <GradeTimeGrid
        intervals={intervals}
        renderGradeFn={this.renderGradeForGrid}
        grades={grades}
        renderCellFn={cellParams => (
          <div style={{minWidth: 80, minHeight: 40, overflow: 'hidden'}}>
            {this.renderCell(groups, cellParams)}
          </div>
        )}
        isFlipped={!isFlipped}
        selection={selection}
        onSelectionChanged={this.onCellClicked}
      />
    );
  }

  renderGradeForGrid(grade) {
    const {studentCountsByGrade} = this.props;
    const studentCount = studentCountsByGrade[grade] || 0;
    return (
      <div>
        <div>{gradeText(grade)} now</div>
        <div style={{color: '#aaa', fontSize: 10}}>{studentCount} students</div>
      </div>
    );
  }

  renderCell(groups, {grade, year, period}) {
    const {nowFn} = this.context;
    const {benchmarkAssessmentKey} = this.state;
    const dataPoints = this.dataPointsForGroup({year, period, grade});
    if (dataPoints.length === 0) return null;

    // guess as grade at time of assessment
    const gradeThen = adjustedGrade(year, grade, nowFn());

    if (isDibels(benchmarkAssessmentKey)) return this.renderDibelsCell(dataPoints, gradeThen, {grade, year, period});
    if (benchmarkAssessmentKey === F_AND_P_ENGLISH) return this.renderFAndPCell(dataPoints, gradeThen, {grade, year, period});
    if (benchmarkAssessmentKey === F_AND_P_SPANISH) return this.renderFAndPCell(dataPoints, gradeThen, {grade, year, period});

    // else
    return <div style={{textAlign: 'center'}} title={JSON.stringify({gradeThen, dataPoints})}>{dataPoints.length}</div>;
  }

  renderDibelsCell(dataPoints, gradeThen, {grade, year, period}) {
    const {studentCountsByGrade} = this.props;
    const {benchmarkAssessmentKey, visualization} = this.state;
    if (dataPoints.length === 0) return null;

    if (visualization === 'BOX_AND_WHISKER') {
      const values = dataPoints.map(d => interpretDibels(d.json.value));
      return (_.compact(values).length === 0)
        ? null
        : <BoxAndWhisker
          values={values}
          showQuartiles={true}
          quartileLabelStyle={{color: '#ccc'}}
        />;
    }

    // default
    const dibelsCounts = {
      [DIBELS_UNKNOWN]: 0,
      [DIBELS_CORE]: 0,
      [DIBELS_STRATEGIC]: 0,
      [DIBELS_INTENSIVE]: 0
    };
    const valuesByStudentId = {};
    _.sortBy(dataPoints, d => d.updated_at).forEach(d => {
      const category = classifyDibels(d.json.value, benchmarkAssessmentKey, gradeThen, period);
      if (category) {
        valuesByStudentId[d.student_id] = category;
      }
    });
    Object.values(valuesByStudentId).forEach(category => {
      dibelsCounts[category] = dibelsCounts[category] + 1;
    });

    // 'students' - 'students with valid data points'
    const missingCount = studentCountsByGrade[grade] - Object.keys(valuesByStudentId).length;
    return (
      <DibelsBreakdownBar
        coreCount={dibelsCounts[DIBELS_CORE]}
        intensiveCount={dibelsCounts[DIBELS_INTENSIVE]}
        strategicCount={dibelsCounts[DIBELS_STRATEGIC]}
        missingCount={dibelsCounts[DIBELS_UNKNOWN] + missingCount}
        height={5}
        labelTop={5}
      />
    );
  }

  renderFAndPCell(dataPoints, gradeThen, {grade, year, period}) {
    const {studentCountsByGrade} = this.props;

    // Count values by student, removing nulls and counting students without
    // data separately below.
    const valuesByStudentId = {};
    _.sortBy(dataPoints, d => d.updated_at).forEach(d => {
      valuesByStudentId[d.student_id] = d.json.value;
    });
    const compactedFAndPValues = _.compact(Object.values(valuesByStudentId));

    // Count is of how many students in cohort now are missing values (maybe they weren't in
    // the district back then).
    const missingNowCount = studentCountsByGrade[grade] - Object.keys(valuesByStudentId).length;
    return (
      <FountasAndPinellBreakdown
        grade={gradeThen}
        benchmarkPeriodKey={period}
        fAndPValuesWithNulls={compactedFAndPValues}
        additionalMissingCount={missingNowCount}
        includeMissing={true}
        height={5}
        labelTop={5}
      />
    );
  }

  renderTable() {
    const {students} = this.props;
    const {benchmarkAssessmentKey, selection} = this.state;
    if (selection === null) {
      return <div style={{fontSize: 14}}>Click a cell to see the list of students.</div>;
    }

    // index by student
    const dataPoints = this.dataPointsForGroup(selection);    
    const {year, period, grade} = selection;
    const dataPointsByStudentId = {};
    dataPoints.forEach(d => {
      if (benchmarkAssessmentKey !== null && benchmarkAssessmentKey !== d.benchmark_assessment_key) return;
      if (d.benchmark_school_year !== year) return;
      if (d.benchmark_period_key !== period) return;
      dataPointsByStudentId[d.student_id] = (dataPointsByStudentId[d.student_id] || []).concat(d);
    });

    // filter students list to grade
    const filteredStudents = students.filter(student => {
      if (student.grade !== grade) return false;
      return true;
    });

    // sort by multiple values, but first by the highest level
    const sortedStudents = _.sortBy(filteredStudents, [
      student => {
        const dataPoints = dataPointsByStudentId[student.id] || [];
        const rankedDataPoints = dataPoints.map(rankBenchmarkDataPoint);
        return _.max(rankedDataPoints) || -1;
      },
      'last_name',
      'first_name'
    ]);

    const rowHeight = 40; // for two lines of student names
    return (
      <ReactModal isOpen={true} onRequestClose={() => this.setState({selection: null})} style={modalFullScreenWithVerticalScroll}>
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
            >
              <Column
                label='Name'
                dataKey='name'
                cellRenderer={this.renderName}
                width={240}
              />
              <Column
                label='Grade'
                dataKey='grade'
                width={80}
              />
              <Column
                label='Value'
                dataKey='value'
                cellRenderer={this.renderValue.bind(this, dataPointsByStudentId, period)}
                width={240}
                flexGrow={1}
              />
            </Table>
          )}
        </AutoSizer>
      </ReactModal>
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

  renderValue(dataPointsByStudentId, benchmarkPeriodKey, cellProps) {
    const {benchmarkAssessmentKey} = this.state;

    const student = cellProps.rowData;
    const dataPoints = dataPointsByStudentId[student.id] || [];
    if (dataPoints.length === 0) return null;

    if (benchmarkAssessmentKey === F_AND_P_ENGLISH) return this.renderFAndPValue(student, dataPoints, benchmarkPeriodKey);
    if (isDibels(benchmarkAssessmentKey)) return this.renderDibelsValue(student, dataPoints, benchmarkPeriodKey);

    return <pre title={JSON.stringify(dataPoints)}>unknown</pre>;
  }

  renderDibelsValue(student, dataPoints, benchmarkPeriodKey) {
    const {nowFn} = this.context;
    const {selection, benchmarkAssessmentKey} = this.state;
    const {year} = selection;
    return (
      <div style={{display: 'flex', flexDirection: 'row'}}>
        {dataPoints.map(d => {
          const gradeThen = adjustedGrade(year, student.grade, nowFn());
          return (
            <div key={d.id}>
              {renderDibels(d.json.value, benchmarkAssessmentKey, gradeThen, benchmarkPeriodKey)}
            </div>
          );
        })}
      </div>
    );
  }

  renderFAndPValue(student, dataPoints, benchmarkPeriodKey) {
    const {nowFn} = this.context;
    const {year} = this.state.selection;
    return (
      <div style={{display: 'flex', flexDirection: 'row'}}>
        {_.sortBy(dataPoints, d => d.updated_at).map(d => {
          const gradeThen = adjustedGrade(year, student.grade, nowFn());
          return (
            <div key={d.id}
              title={JSON.stringify({gradeThen, benchmarkPeriodKey, d}, null, 2)}
              style={{display: 'flex', flexDirection: 'row'}}>
              {renderFAndPLevel(d.json.value, gradeThen, benchmarkPeriodKey, year)}
            </div>
          );
        })}
      </div>
    );
  }
}
ReadingDebugView.contextTypes = {
  districtKey: PropTypes.string.isRequired,
  nowFn: PropTypes.func.isRequired
};
ReadingDebugView.propTypes = {
  groups: PropTypes.object.isRequired,
  studentCountsByGrade: PropTypes.object.isRequired,
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
  schools: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    local_id: PropTypes.string.isRequired
  })).isRequired,
  schoolIdNow: PropTypes.string,
  onSchoolIdNowChanged: PropTypes.func.isRequired
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


function renderFAndPLevel(text, grade, benchmarkPeriodKey, year) {
  if (!text) return null;
  const level = interpretFAndPEnglish(text);
  if (!level) return null;

  const category = classifyFAndPEnglish(level, grade, benchmarkPeriodKey);
  const color = {
    high,
    medium,
    low
  }[category] || missing;
  return (
    <div style={{display: 'flex', alignItems: 'center'}}>
      {badgeWithPadding(level, color)}
      <div style={{marginLeft: 10, fontSize: 10}}>{gradeText(grade)}, {benchmarkPeriodKey} {year}-{year+1}</div> 
    </div>
  );
}

function renderDibels(text, benchmarkAssessmentKey, grade, benchmarkPeriodKey) {
  if (!text) return none();
  const category = classifyDibels(text, benchmarkAssessmentKey, grade, benchmarkPeriodKey);
  if (!category) return none();
  const color = colorForDibelsCategory(category);
  return badgeWithPadding(text, color);
}

function none() {
  return <span style={{paddingLeft: 5}}>(none)</span>;
}

function badgeWithPadding(el, color) {
  return (
    <div style={{paddingLeft: 5, display: 'flex', flexDirection: 'row'}}>
      <div style={{display: 'inline-block', marginRight: 5}}>
        {coloredBadge(el, color)}
      </div>
    </div>
  );
}

function coloredBadge(el, color) {
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
    }}>{el}</div>
  );
}

function isDibels(benchmarkAssessmentKey) {
  return ([
    DIBELS_DORF_WPM,
    DIBELS_DORF_ACC,
    DIBELS_DORF_ERRORS,
    DIBELS_FSF,
    DIBELS_LNF,
    DIBELS_PSF,
    DIBELS_NWF_CLS,
    DIBELS_NWF_WWR
  ].indexOf(benchmarkAssessmentKey) !== -1);
}