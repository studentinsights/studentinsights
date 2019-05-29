import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Table, Column, AutoSizer} from 'react-virtualized';
import ReactModal from 'react-modal';
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
import DownloadIcon from '../components/DownloadIcon';
import ExperimentalBanner from '../components/ExperimentalBanner';
import StudentPhotoCropped from '../components/StudentPhotoCropped';
import DibelsBreakdownBar from '../components/DibelsBreakdownBar';
import BoxAndWhisker from '../components/BoxAndWhisker';
import {classifyFAndPEnglish, interpretFAndPEnglish} from '../reading/readingData';
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
  interpretDibels
} from '../reading/readingData';


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
    return apiFetchJson('/api/reading_debug/reading_debug_json');
  }

  render() {
    return (
      <div className="ReadingDebugPage" style={styles.flexVertical}>
        <ExperimentalBanner />
        <SectionHeading titleStyle={styles.title}>
          <div>Benchmark Reading Data (DEBUG)</div>
          <a href="/reading/debug_csv"><DownloadIcon /></a>
        </SectionHeading>
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
        groups={json.groups}
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
            <SimpleFilterSelect
              placeholder="Visualization..."
              style={{width: '16em'}}
              value={visualization}
              onChange={this.onVisualizationChanged}
              options={[
                {value: ALL, label: 'Default'},
                {value: 'BOX_AND_WHISKER', label: 'Box and whisker'}
              ]} />
            <div
              style={{paddingLeft: 10, cursor: 'pointer', fontWeight: isFlipped ? 'bold' : 'normal'}}
              onClick={this.onFlippedClicked}>Flip table</div>
          </div>
          <div>
            <a
              target="_blank" rel="noopener noreferrer"
              href="https://github.com/studentinsights/studentinsights/blob/master/app/assets/javascripts/reading/thresholds.js">thresholds</a>
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

  renderGrid() {
    const {groups} = this.props;
    const {selection, isFlipped} = this.state;
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

  renderCell(groups, {grade, year, period}) {
    const {benchmarkAssessmentKey} = this.state;
    const dataPoints = this.dataPointsForGroup({year, period, grade});
    if (dataPoints.length === 0) return null;

    if (isDibels(benchmarkAssessmentKey)) return this.renderDibelsCell(dataPoints, {grade, year, period});
    if (benchmarkAssessmentKey === F_AND_P_ENGLISH) return this.renderFAndPCell(dataPoints, {grade, year, period});
    if (benchmarkAssessmentKey === F_AND_P_SPANISH) return this.renderFAndPCell(dataPoints, {grade, year, period});

    // else
    return <div style={{textAlign: 'center'}} title={JSON.stringify(dataPoints)}>{dataPoints.length}</div>;
  }

  renderDibelsCell(dataPoints, {grade, year, period}) {
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
    dataPoints.forEach(d => {
      if (!d.json.value) return;
      const category = classifyDibels(d.json.value, benchmarkAssessmentKey, grade, period);
      if (!category) return;
      dibelsCounts[category] = dibelsCounts[category] + 1;
    });
    return (
      <DibelsBreakdownBar
        coreCount={dibelsCounts[DIBELS_CORE]}
        intensiveCount={dibelsCounts[DIBELS_STRATEGIC]}
        strategicCount={dibelsCounts[DIBELS_INTENSIVE]}
        missingCount={dibelsCounts[DIBELS_UNKNOWN]}
        height={5}
        labelTop={5}
      />
    );
  }

  renderFAndPCell(dataPoints, {grade, year, period}) {
    const fAndPValuesWithNulls = dataPoints.map(dataPoint => dataPoint.json.value);
    return (
      <FountasAndPinellBreakdown
        grade={grade}
        benchmarkPeriodKey={period}
        fAndPValuesWithNulls={fAndPValuesWithNulls}
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

    const dataPoints = this.dataPointsForGroup(selection);

    // filter students list
    const {year, period, grade} = selection;
    const dataPointsByStudentId = {};
    dataPoints.forEach(d => {
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
                  label='Value'
                  dataKey='value'
                  cellRenderer={this.renderValue.bind(this, dataPointsByStudentId, period)}
                  width={100}
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
    const {benchmarkAssessmentKey} = this.state;
    return (
      <div>
        {dataPoints.map(d => (
          <div key={d.id}>
            {renderDibels(d.json.value, benchmarkAssessmentKey, student.grade, benchmarkPeriodKey)}
          </div>
        ))}
      </div>
    );
  }

  renderFAndPValue(student, dataPoints, benchmarkPeriodKey) {
    return (
      <div>
        {dataPoints.map(d => (
          <div key={d.id} style={{display: 'flex', flexDirection: 'row'}}>
            {renderFAndPLevel(d.json.value, student.grade, benchmarkPeriodKey)}
          </div>
        ))}
      </div>
    );
  }
}
ReadingDebugView.propTypes = {
  groups: PropTypes.object.isRequired,
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

  const category = classifyFAndPEnglish(level, grade, benchmarkPeriodKey);
  const color = {
    high,
    medium,
    low
  }[category] || missing;
  return badgeWithPadding(level, color);
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