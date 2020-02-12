import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {apiFetchJson} from '../helpers/apiFetchJson';
import memoizer from '../helpers/memoizer';
import {updateGlobalStylesToTakeFullHeight} from '../helpers/globalStylingWorkarounds';
import {toSchoolYear} from '../helpers/schoolYear';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import ExperimentalBanner from '../components/ExperimentalBanner';
import Histogram from '../components/Histogram';
import StudentPhotoCropped from '../components/StudentPhotoCropped';
import BreakdownBar from '../components/BreakdownBar';
import SimpleFilterSelect from '../components/SimpleFilterSelect';
import BoxAndWhisker from '../components/BoxAndWhisker';
import {classifyFAndPEnglish, interpretFAndPEnglish} from '../reading/fAndPInterpreter';
import {benchmarkPeriodKeyFor} from '../reading/readingData';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import {
  high,
  medium,
  low,
  missing
} from '../helpers/colors';
import GradeTimeGrid from './GradeTimeGrid';
import {starBucket} from '../class_lists/studentFilters';

// For reviewing, debugging and developing new ways to make use of
// or revise reading data.
export default class ReadingDebugStarPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  componentDidMount() {
    updateGlobalStylesToTakeFullHeight();
  }

  fetchJson() {
    return apiFetchJson('/api/reading_debug/star_reading_debug_json');
  }

  render() {
    return (
      <div className="ReadingDebugStarPage" style={styles.flexVertical}>
        <ExperimentalBanner />
        <SectionHeading>STAR Reading data (DEBUG)</SectionHeading>
        <GenericLoader
          promiseFn={this.fetchJson}
          style={styles.flexVertical}
          render={this.renderJson} />
      </div>
    );
  }

  renderJson(json) {
    return (
      <ReadingDebugStarView
        students={json.students}
        starReadings={json.star_readings}
        cutoffMoment={toMomentFromTimestamp(json.cutoff_date)}
        grades={json.grades}
        schools={json.schools}
      />
    );
  }
}


export class ReadingDebugStarView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visualization: 'HISTOGRAM',
      selection: null,
      isFlipped: false,
    };

    this.renderName = this.renderName.bind(this);
    this.onCellClicked = this.onCellClicked.bind(this);
    this.onVisualizationChange = this.onVisualizationChange.bind(this);
    this.onFlippedClicked = this.onFlippedClicked.bind(this);
    this.memoize = memoizer();
  }

  groups() {
    return this.memoize(['groups', this.state, this.props], () => {
      const {students, starReadings} = this.props;
      const studentsById = students.reduce((map, student) => {
        return {...map, [student.id]: student};
      }, {});
      return _.groupBy(starReadings, result => {
        const student = studentsById[result.student_id];
        const dateTakenMoment = toMomentFromTimestamp(result.date_taken);
        return [
          toSchoolYear(dateTakenMoment),
          benchmarkPeriodKeyFor(dateTakenMoment),
          student.grade,
        ].join('-');
      });
    });
  }

  onCellClicked(selection) {
    this.setState({selection});
  }

  onVisualizationChange(visualization) {
    this.setState({visualization});
  }

  onFlippedClicked() {
    const {isFlipped} = this.state;
    this.setState({isFlipped: !isFlipped});
  }

  render() {
    const {isFlipped} = this.state;
    return (
      <div style={{...styles.flexVertical, margin: 10}}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          {this.renderVisualizationSelect()}
          <div
            style={{paddingLeft: 10, cursor: 'pointer', fontWeight: isFlipped ? 'bold' : 'normal'}}
            onClick={this.onFlippedClicked}>Flip table</div>
        </div>
        <div style={{marginTop: 20}}>
          {this.renderList()}
        </div>
        <div style={{
          flex: 1,
          marginTop: 10,
          borderTop: '1px solid #ccc',
          paddingTop: 10}}>{this.renderTable()}</div>
      </div>
    );
  }

  renderVisualizationSelect() {
    const {visualization} = this.state;
    const options = [
      {value: 'HISTOGRAM', label: 'Histogram'},
      {value: 'BOX_AND_WHISKER', label: 'Box and whisker'},
      {value: 'COLOR_BUCKETS', label: 'Color buckets'},
      {value: 'ASSESSMENT_COUNT', label: 'Assessment count'}
    ];
    return (
      <SimpleFilterSelect
        placeholder="Visualization..."
        value={visualization}
        onChange={this.onVisualizationChange}
        options={options} />
    );
  }

  renderList() {
    return this.memoize(['renderList', this.state, this.props], () => {
      const {grades} = this.props;
      const {selection, isFlipped} = this.state;
      const groups = this.groups();

      const intervals = [
        [2017, 'winter'],
        [2017, 'spring'],
        [2018, 'fall'],
        [2018, 'winter'],
        [2018, 'spring'],
        [2019, 'fall'],
        [2019, 'winter']
      ];

      return (
        <GradeTimeGrid
          intervals={intervals}
          grades={grades}
          renderCellFn={cellParams => this.renderStarCell(groups, cellParams)}
          selection={selection}
          isFlipped={!isFlipped}
          onSelectionChanged={this.onCellClicked}
        />
      );
    });
  }

  renderStarCell(groups, {grade, year, period}) {
    const {visualization} = this.state;
    const key = [year, period, grade].join('-');
    const starReadings = groups[key] || [];
    
    // branch!
    if (visualization === 'BOX_AND_WHISKER') {
      const values = starReadings.map(r => r.percentile_rank);
      return (_.compact(values).length === 0)
        ? null
        : <BoxAndWhisker
          values={values}
          showQuartiles={true}
          quartileLabelStyle={{color: '#ccc'}}
        />;
    }

    if (visualization === 'COLOR_BUCKETS') {
      const counts = _.countBy(starReadings, result => {
        return (!result.percentile_rank)
          ? 'missing'
          : starBucket(result.percentile_rank);
      });
      const lowCount = counts.low || 0;
      const mediumCount = counts.medium || 0;
      const highCount = counts.high || 0;
      const missingCount = counts.missing || 0;
      
      const items = [
        { left: 0, width: missingCount, color: missing, key: 'missing' },
        { left: missingCount, width: highCount, color: high, key: 'high' },
        { left: missingCount + highCount, width: mediumCount, color: medium, key: 'medium' },
        { left: missingCount + highCount + mediumCount, width: lowCount, color: low, key: 'low' }
      ];
      return (
        <BreakdownBar
          items={items}
          height={5}
          labelTop={5}
        />
      );
    }

    if (visualization === 'HISTOGRAM') {
      return this.renderHistogram(starReadings);
    }

    if (visualization === 'ASSESSMENT_COUNT') {
      return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          {starReadings.length}
        </div>
      );
    }
  }

  renderHistogram(starReadings) {
    const values = starReadings.map(r => r.percentile_rank);
    return (
      <Histogram
        bucketSize={10}
        range={[0, 100]}
        values={values}
        height={50}
        yScale={0.5}
        style={{
          minWidth: 80,
          backgroundColor: '#f8f8f8'
        }}
        innerStyle={{
          background: 'rgb(149,206,255)',
          borderTop: '1px solid blue'
        }}
      />
    );
  }

  renderTable() {
    return <div>Table not added yet.</div>;
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
ReadingDebugStarView.propTypes = {
  cutoffMoment: PropTypes.object.isRequired,
  grades: PropTypes.arrayOf(PropTypes.string).isRequired,
  starReadings: PropTypes.arrayOf(PropTypes.object).isRequired,
  students: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    grade: PropTypes.string.isRequired
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
