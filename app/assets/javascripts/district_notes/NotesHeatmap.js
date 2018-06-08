import React from 'react';
import _ from 'lodash';
import Select from 'react-select';
import CalendarHeatmap from '../components/CalendarHeatmap';
import isDarkColor from '../helpers/isDarkColor';


// This is included already in application.js
// import 'css-loader?react-select/dist/react-select.css';

// This renders a summary of when users are recording notes, and lets
// folks break it down by grade as well.
export default class NotesHeatmap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: false,
      schoolId: _.first(props.schools).id,
      year: _.first(yearsForSelect(props.heatmapNotes))
    };

    this.onExpandClicked = this.onExpandClicked.bind(this);
    this.onYearChanged = this.onYearChanged.bind(this);
    this.onSchoolIdChanged = this.onSchoolIdChanged.bind(this);
  }

  currentSchoolName() {
    const {schools} = this.props;
    const {schoolId} = this.state;

    if (schoolId === null) return null;
    return _.find(schools, { id: schoolId }).name;
  }

  orderedGrades() {
    const {heatmapNotes} = this.props;
    return _.sortBy(_.uniq(heatmapNotes.map(note => note.student.grade)), grade => {
      if (grade === 'PK') return 0.3;
      if (grade === 'KF') return 0.5;
      return parseInt(grade, 10);
    });
  }

  percentOfType(notes, eventNoteTypeId) {
    const count = _.where(notes, { event_note_type_id: eventNoteTypeId }).length;
    return Math.round(100 * count / notes.length);
  }

  // Based on a five-value ColorBrewer scale
  colorScale() {
    return d3.scale.quantile()
      .domain([0, 1, 5, 10, 50, 100])
      .range([
        'white',
        '#edf8e9',
        '#bae4b3',
        '#74c476',
        '#31a354',
        '#006d2c'
      ]);
  }

  // Transform this into a map of {dateText => number},
  // where dateText is YYYY-MM-DD and number is the notes that day
  dataForCalendar(notes) {
    const groupedByDate = _.groupBy(notes, note => moment.utc(note.recorded_at).format('YYYY-MM-DD'));
    const list = Object.keys(groupedByDate).map(dateText => {
      const notesForDate = groupedByDate[dateText];
      return {
        date: dateText,
        notes: notesForDate,
        percentage: (100 * notesForDate.length / notes.length)
      };
    });
    return d3.nest()
      .key(function(d) { return d.date; })
      .rollup(function(d) { return d[0].notes.length; })
      .map(list);
  }

  onExpandClicked() {
    this.setState({ isExpanded: true });
  }

  onYearChanged(yearText) {
    this.setState({ year: parseInt(yearText, 10) });
  }

  onSchoolIdChanged(schoolId) {
    this.setState({schoolId});
  }

  render() {
    const {heatmapNotes} = this.props;
    const {isExpanded} = this.state;

    return (
      <div className="NotesHeatmap">
        {this.renderTitleBar()}
        {this.renderNotesCalendar(this.currentSchoolName() || 'District', heatmapNotes)}
        {isExpanded 
          ? this.renderExpanded()
          : <div className="btn" style={{display: 'inline-block', margin: 10, marginLeft: 160}} onClick={this.onExpandClicked}>Show each grade</div>}
      </div>
    );
  }

  renderTitleBar() {
    return (
      <div style={styles.legend}>
        <h1>Notes over time</h1>
        <div style={{display: 'flex'}}>
          {this.renderColorLegend()}
          {this.renderSchoolSelect()}
          {this.renderYearSelect()}
        </div>
      </div>
    );   
  }

  renderColorLegend() {
    const color = this.colorScale();
    return (
      <div style={styles.swatches}>
        <div style={styles.legendText}>Legend</div>
        {color.domain().map(value => this.renderSwatch(color, value), this)}
      </div>
    );
  }

  renderYearSelect() {
    const {year} = this.state;
    const {heatmapNotes} = this.props;
    const possibleYears = yearsForSelect(heatmapNotes);
    return (
      <Select
        style={{width: '8em', marginLeft: 20}}
        simpleValue
        clearable={false}
        searchable={false}
        value={year.toString()}
        onChange={this.onYearChanged}
        options={possibleYears.map(value => {
          return { value: `${value}`, label: `Year: ${value}` };
        })} />
    );
  }

  renderSchoolSelect() {
    const {schoolId} = this.state;
    const {schools} = this.props;
    const options = [{value: null, label: 'All'}].concat(schools.map(school => {
      return { value: school.id, label: school.name };
    }));

    return (
      <Select
        style={{width: '12em', marginLeft: 20}}
        simpleValue
        clearable={false}
        searchable={false}
        value={schoolId}
        onChange={this.onSchoolIdChanged}
        options={options} />
    );
  }

  renderSwatch(colorScale, value) {
    const background = colorScale(value);
    const fontSize = (value.toString().length > 2) ? 10 : 12;
    const color = isDarkColor(background) ? '#eee' : '#111';

    return <div key={value} style={{...styles.swatch, background, fontSize, color}}>
      {(value === 0) ? null : <span style={{opacity: 0.25}}>&lt;</span>}
      {value}
    </div>;
  }

  renderExpanded() {
    const {heatmapNotes} = this.props;
    const grades = this.orderedGrades();
    return (
      <div>
        {grades.map(grade => {
          const filteredNotes = heatmapNotes.filter(note => note.student.grade === grade);
          return this.renderNotesCalendar(grade, filteredNotes);
        })}
      </div>
    );
  }

  renderNotesCalendar(label, notes) {
    const {year, schoolId} = this.state;
    const filteredNotes = notes.filter(note => {
      if (schoolId !== null && note.student.school_id !== schoolId) return false;
      if (parseInt(moment.utc(note.recorded_at).format('YYYY'), 10) !== year) return false;
      return true;
    });
    const data = this.dataForCalendar(filteredNotes);
    

    return (
      <div key={label} style={{display: 'flex', alignItems: 'center', padding: 20}}>
        <div style={{width: 100, textAlign: 'right', paddingRight: 20}}>
          <h2 style={{marginBottom: 5}}>{label}</h2>
          <div style={{fontSize: 12}}>
            <div>{filteredNotes.length} notes</div>
            <div>SST: {this.percentOfType(filteredNotes, 300)}%</div>
            <div>MTSS: {this.percentOfType(filteredNotes, 301)}%</div>
          </div>
        </div>
        <CalendarHeatmap
          data={data}
          years={[year, year + 1]}
          color={this.colorScale()} />
      </div>
    );
  }
}
NotesHeatmap.propTypes = {
  heatmapNotes: React.PropTypes.array.isRequired,
  schools: React.PropTypes.array.isRequired
};

function yearsForSelect(heatmapNotes) {
  return _.sortBy(_.uniq(heatmapNotes.map(note => { 
    const yearText = moment.utc(note.recorded_at).format('YYYY');
    return parseInt(yearText, 10);
  })));
}

const styles = {
  legend: {
    display: 'flex',
    padding: 20,
    width: 'auto',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendText: {
    paddingRight: 10,
    fontSize: 12
  },
  swatches: {
    display: 'flex',
    alignItems: 'center'
  },
  swatch: {
    width: 32,
    height: 32,
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};
