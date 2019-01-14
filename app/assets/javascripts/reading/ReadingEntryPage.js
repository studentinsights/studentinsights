import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import d3 from 'd3';
import hash from 'object-hash';
import ReactModal from 'react-modal';
import {Table, Column, AutoSizer, SortDirection} from 'react-virtualized';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {rankedByGradeLevel} from '../helpers/SortHelpers';
import {hasActive504Plan} from '../helpers/PerDistrict';
import {gradeText} from '../helpers/gradeText';
import {hasAnySpecialEducationData} from '../helpers/specialEducation';
import {isEnglishLearner, accessLevelNumber} from '../helpers/language';
import {toMomentFromRailsDate} from '../helpers/toMoment';
import {toSchoolYear, firstDayOfSchool} from '../helpers/schoolYear';
import {updateGlobalStylesToTakeFullHeight} from '../helpers/globalStylingWorkarounds';
import PerDistrictContainer from '../components/PerDistrictContainer';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import {modalFromRight} from '../components/HelpBubble';
import FilterBar from '../components/FilterBar';
import SelectHomeroomByEducator from '../components/SelectHomeroomByEducator';
import {ALL} from '../components/SimpleFilterSelect';
import HelpBubble, {
  modalFullScreenFlex,
  dialogFullScreenFlex
} from '../components/HelpBubble';
import {toCsvTextFromTable} from '../helpers/toCsvFromTable';
import DownloadCsvLink from '../components/DownloadCsvLink';
import IepDialog from './IepDialog';
import LanguageStatusLink from '../student_profile/LanguageStatusLink'; // TODO import path
import EdPlansPanel from '../student_profile/EdPlansPanel'; // TODO import path
import {inferNeed} from './inferNeed';

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
    const {grade} = this.props;
    return (
      <ReadingEntryPageView
        grade={grade}
        school={json.school}
        readingStudents={json.reading_students}
        mtssNotes={json.latest_mtss_notes}
      />
    );
  }
}
ReadingEntryPage.propTypes ={
  schoolSlug: PropTypes.string.isRequired,
  grade: PropTypes.string.isRequired
};


export class ReadingEntryPageView extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      isDownloadOpen: false,
      sortBy: 'name',
      sortDirection: SortDirection.ASC,
      searchText: '',
      homeroomId: ALL
    };
    this.onTableSort = this.onTableSort.bind(this);
    this.onDownloadDialogToggled = this.onDownloadDialogToggled.bind(this);
    this.onSearchChanged = this.onSearchChanged.bind(this);
    this.onHomeroomChanged = this.onHomeroomChanged.bind(this);
  }

  filteredStudents(students) {
    const {searchText, homeroomId} = this.state;
    return students.filter(student => {
      if (`${student.first_name} ${student.last_name}`.toLowerCase().indexOf(searchText.toLowerCase()) === -1) return false;
      if (homeroomId !== ALL && student.homeroom.id !== homeroomId) return false;
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

  orderedStudents(students) {
    const {districtKey} = this.context;
    const {sortBy, sortDirection} = this.state;

    // map dataKey to an accessor/sort function
    const sortFns = {
      fallback(student) { return student[sortBy]; },
      grade(student) { return rankedByGradeLevel(student.grade); },
      name(student) { return `${student.last_name}, ${student.first_name}`; },
      iep(student) { return hasAnySpecialEducationData(student, {}) ? 'IEP' : null; },
      access(student) {
        if (!isEnglishLearner(districtKey, student.limited_english_proficiency)) return null;
        return accessLevelNumber(student.access);
      },
      plan_504(student) { return hasActive504Plan(student.plan_504) ? '504' : null; },
      dibels(student) { return latestDibels(student); },
      f_and_p(student) { return latestFAndP(student) || ''; },
      star_reading(student) { return latestStar(student); },
      dibels_grade_3_fall_dibels_dorf_wpm(student) { return parseFloat(tryDibels(student.dibels, '3', 'fall', 'dibels_dorf_wpm') || 0); },
      dibels_grade_1_spring_dibels_dorf_wpm(student) { return parseFloat(tryDibels(student.dibels, '1', 'spring', 'dibels_dorf_wpm') || 0); },
      dibels_grade_3_fall_dibels_dorf_acc(student) { return parseFloat(tryDibels(student.dibels, '3', 'fall', 'dibels_dorf_acc') || 0); },
      dibels_grade_1_spring_dorf_acc(student) { return parseFloat(tryDibels(student.dibels, '1', 'spring', 'dibels_dorf_acc') || 0); },
      instructional_general(student) { return parseInstructionalFocus(student)[0]; },
      instructional_specific(student) { return parseInstructionalFocus(student)[1]; },
      homeroom(student) { return student.homeroom.educator.full_name; }
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

  onSearchChanged(e) {
    this.setState({searchText: e.target.value});
  }

  onHomeroomChanged(homeroomId) {
    this.setState({homeroomId});
  }

  render() {
    const {school, grade, readingStudents} = this.props;
    const students = this.withMerged(readingStudents);
    return (
      <div style={{...styles.flexVertical, margin: 10}}>
        <SectionHeading titleStyle={styles.title}>
          <div>Add Benchmark Reading Data: {gradeText(grade)} at {school.name}</div>
          {this.renderDownloadLink(students)}
        </SectionHeading>
        {this.renderFilters()}
        {this.renderTable(students)}
      </div>
    );
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

  renderTable(students) {
    const {nowFn, districtKey} = this.context;
    const {grade} = this.props;
    const {sortDirection, sortBy} = this.state;
    const sortedStudents = this.orderedStudents(this.filteredStudents(students));
    const rowHeight = 40; // for two lines of student names
    const columns = describeColumns(districtKey, grade, nowFn());

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
    const {districtKey, nowFn} = this.context;
    const {grade} = this.props;
    const columns = describeColumns(districtKey, grade, nowFn());
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
    const {school, grade} = this.props;
    const now = nowFn();
    const filename = `Reading-${school.slug.toUpperCase()}-${grade}-${now.format('YYYY-MM-DD')}.csv`;
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
ReadingEntryPageView.contextTypes = {
  districtKey: PropTypes.string.isRequired,
  nowFn: PropTypes.func.isRequired
};
ReadingEntryPageView.propTypes = {
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
  downloadButton: {
    display: 'inline-block',
    marginBottom: 10,
    color: 'white'
  },
  cell: {
    display: 'flex',
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
  },
  link: {
    fontSize: 14
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

function describeColumns(districtKey, grade, nowMoment) {
  const homeroomColor = d3.scale.ordinal()
    .range([
      '#bcbddc',
      '#9e9ac8',
      '#807dba',
      '#6a51a3',
      '#4a1486'
    ]);
  return [{
    label: 'Name',
    dataKey: 'name',
    cellRenderer: renderName,
    flexGrow: 1,
    width: 200,
    style: styles.cell
  }, {
    label: <span>Homeroom</span>,
    dataKey: 'homeroom',
    cellRenderer({rowData}) {
      return <span style={{textAlign: 'center', fontSize: 12, opacity: 0.75, color: 'white', width: 80, paddingLeft: 5, paddingRight: 5, paddingTop: 3, paddingBottom: 3, backgroundColor: homeroomColor(rowData.homeroom.id)}}>{rowData.homeroom.educator.full_name.split(',')[0]}</span>;
    },
    width: 100,
    style: styles.cell
  }, {
    label: '504',
    dataKey: 'plan_504',
    cellRenderer({rowData}) {
      if (!hasActive504Plan(rowData.plan_504)) return null;
      return (
        <HelpBubble
          style={{marginLeft: 0, display: 'block'}}
          teaser="504"
          linkStyle={styles.link}
          modalStyle={modalFullScreenFlex}
          dialogStyle={dialogFullScreenFlex}
          title={`${rowData.first_name}'s 504 plan`}
          withoutSpacer={true}
          withoutContentWrapper={true}
          content={render504Dialog(districtKey, rowData)}
        />
      );
    },
    width: 50,
    style: styles.cell
  }, {
    label: 'IEP',
    dataKey: 'iep',
    cellRenderer({rowData}) {
      if (!hasAnySpecialEducationData(rowData, rowData.latest_iep_document)) return null;
      return (
        <PerDistrictContainer districtKey={districtKey}>
          <IepDialog
            student={rowData}
            iepDocument={rowData.latest_iep_document}>
            IEP
          </IepDialog>
        </PerDistrictContainer>
      );
    },
    width: 50,
    style: styles.cell
  }, {
    label: <span>English<br/>Learner</span>,
    dataKey: 'access',
    cellRenderer({rowData}) {
      if (!isEnglishLearner(districtKey, rowData.limited_english_proficiency)) return null;

      const level = accessLevelNumber(rowData.access);
      const linkText = (level) ? `Level ${level}` : 'ELL';
      return (
        <PerDistrictContainer districtKey={districtKey}>
          <LanguageStatusLink
            linkEl={linkText}
            style={styles.link}
            studentFirstName={rowData.first_name}
            ellTransitionDate={rowData.ell_transition_date}
            limitedEnglishProficiency={rowData.limited_english_proficiency}
            access={rowData.access}
          />
        </PerDistrictContainer>
      );
    },
    width: 100,
    style: styles.cell
  }, {
    label: <span>MTSS,<br/>2 years</span>,
    dataKey: 'mtss',
    cellRenderer({rowData}) {
      return renderMtss(rowData.mtss, nowMoment);
    },
    width: 100,
    style: styles.cell
  }, {
    label: <span>Engagement<br/><span style={{fontSize: 10, fontWeight: 'normal'}}>high, medium, low</span></span>,
    dataKey: 'f_and_p',
    cellRenderer({rowData}) {
      return <input style={{fontSize: 12, padding: 3, width: 60}} type="text" />;
    },
    width: 120,
    style: styles.cell
  }, {
    label: <span>F&P level</span>,
    dataKey: 'f_and_p',
    cellRenderer({rowData}) {
      return <input style={{fontSize: 12, padding: 3, width: 60}} type="text"  />;
    },
    width: 120,
    style: styles.cell
  }, {
    label: <span>DIBELS ORF<br/>accuracy</span>,
    dataKey: 'f_and_p',
    cellRenderer({rowData}) {
      return <input style={{fontSize: 12, padding: 3, width: 60}} type="text" />;
    },
    width: 120,
    style: styles.cell
  }, {
    label: <span>DIBELS ORF<br/>words per minute</span>,
    dataKey: 'f_and_p',
    cellRenderer({rowData}) {
      return <input style={{fontSize: 12, padding: 3, width: 60}} type="text"  />;
    },
    width: 120,
    style: styles.cell
  }, {
    label: <span>What else?</span>,
    dataKey: 'instructional_specific',
    cellRenderer({rowData}) {
      return <input style={{fontSize: 12, padding: 3}} type="text"  />;
    },
    width: 180,
    style: styles.cell
  }];
}


function renderName(cellProps) {
  const student = cellProps.rowData;

  // not sure image looks good, also probably need caching instead of naive
  // image tags
  return (
    <div>
      {/*<StudentPhoto student={student} height={40} />*/}
      <a style={{fontSize: 14}} href={`/students/${student.id}`} target="_blank" rel="noopener noreferrer">{student.first_name} {student.last_name}</a>
    </div>
  );
}


function tryDibels(dibels, grade, assessmentPeriod, assessmentKey) {
  const d = _.find(dibels, {
    grade,
    assessment_period: assessmentPeriod,
    assessment_key: assessmentKey,
  });

  return d ? d.data_point : null;
}


function dibelsSparkline(params = {}) {
  const {dibels, dibelsKey, benchmark, risk, domain} = params;
  const width = 100;
  const height = 40;
  const yPad = 5;

  const values = [
    tryDibels(dibels, '1', 'spring', dibelsKey),
    tryDibels(dibels, '2', 'fall', dibelsKey),
    tryDibels(dibels, '2', 'winter', dibelsKey),
    tryDibels(dibels, '2', 'spring', dibelsKey),
    tryDibels(dibels, '3', 'fall', dibelsKey)
  ];

  const x = d3.scale.linear()
    .domain([0, values.length - 1])
    .range([0, width]);
  const y = d3.scale.linear()
    .domain(domain)
    .range([height - yPad, yPad]);

  const line = d3.svg.area()
    .x((d, i) => x(i))
    .y0(height - yPad)
    .y1(d => y(d))
    .defined(d => d)
    .interpolate('basis');
  // const line = d3.svg.line()
  //   .x((d, i) => x(i))
  //   .y(d => y(d))
  //   .defined(d => d)
  //   .interpolate('basis');

  // const isGrowing = _.last(_.compact(values)) > _.first(_.compact(values));
  // const strokeWidth = isGrowing ? 2 : 1;
  // const color = isGrowing ? 'green' : '#666';

  // third grade dorf wpm
  const aboveBenchmark = (_.last(_.compact(values)) >= benchmark);
  const belowRisk = (_.last(_.compact(values)) <= risk);
  const strokeWidth = 1;
  const color = aboveBenchmark ? '#85b985' : belowRisk ? 'orange' : '#ccc';
  return (
    <svg width={width} height={40} style={{borderBottom: '1px dashed #eee', borderRight: '1px dashed #eee'}}>
      <path d={line(values)} stroke={color} strokeWidth={strokeWidth} fill={color} />
    </svg>
  );
}


function badge(maybeValue, label) {
  return (maybeValue) ? plainBadge(label) : null;
}

function plainBadge(label) {
  return <a href="#">{label}</a>;
}




function render504Dialog(districtKey, student) {
  const edPlans = student.ed_plans;
  const studentName = `${student.first_name} ${student.last_name}`;
  return (
    <PerDistrictContainer districtKey={districtKey}>
      <EdPlansPanel edPlans={edPlans} studentName={studentName} />
    </PerDistrictContainer>
  );
}


function sampleInstructionalFocus(student) {
  // return (Math.random() > 0.5) 
  //   ? 'fluency' : (Math.random() > 0.5)
  //   ? 'decoding' : (Math.random() > 0.5)
  //   ? 'word solving' : (Math.random() > 0.5)
  //   ? 'accuracy' : (Math.random() > 0.5);

  const choices = [
    'within: solving words',
    'within: monitoring and correcting',
    'within: searching for and using info',
    'within: summarizing',
    'within: maintaining fluency',
    'within: adjusting',
    'beyond: predicting',
    'beyond: making connections',
    'beyond: synthesizing',
    'beyond: inferring',
    'about: analyzing',
    'about: critiquing'
  ];
  const bucket = parseInt(hash.MD5(student.id).slice(0, 8), 16);
  return choices[bucket % choices.length];
}

function parseInstructionalFocus(rowData) {
  const inference = inferNeed(rowData);
  // return [null, <span title={inference.why}>{inference.need.toLowerCase()}</span>];
  return [null, inference.need.toLowerCase()];

  // if (window.location.search.indexOf('instruction') === -1) {
  //   return [null, null];
  // }
  // return rowData.instructional_focus.split(': ');
}


function dibelsColumns(params = {}) {
  const {dibelsKey, title, benchmark, risk, domain} = params;
  return [{
    label: '',
    dataKey: `dibels_grade_1_spring_${dibelsKey}`,
    cellRenderer({rowData}) {
      return <span style={{
        justifyContent: 'flex-end',
        display: 'flex',
        flex: 1,
        paddingRight: 5,
        height: '100%',
        paddingBottom: 2,
        fontSize: 10,
        opacity: 0.50,
        color: '#333',
        alignItems: 'flex-end'
      }}>{tryDibels(rowData.dibels, '1', 'spring', dibelsKey)}</span>;
    },
    width: 100,
    style: styles.cell
  }, {
    label: <span>{title},<br/>2 years</span>,
    dataKey: `dibels_grade_3_fall_${dibelsKey}`,
    cellRenderer({rowData}) {
      return dibelsSparkline({
        dibels: rowData.dibels,
        dibelsKey,
        domain,
        benchmark,
        risk
      });
    },
    width: 110,
    style: styles.cell
  }, {
    label: '',
    dataKey: `dibels_grade_3_fall_${dibelsKey}`,
    cellRenderer({rowData}) {
      const value = tryDibels(rowData.dibels, '3', 'fall', dibelsKey);
      const aboveBenchmark = (value >= benchmark);
      const belowRisk = (value <= risk);
      const color = aboveBenchmark ? '#85b985' : belowRisk ? 'orange' : '#ccc';
      return <span style={{
        display: 'flex',
        fontWeight: 'bold',
        color,
        paddingLeft: 5,
        width: '2.5em',
        textAlign: 'center',
        height: '100%',
        paddingBottom: 2,
        alignItems: 'flex-end',
        justifyContent: 'flex-start'
      }}>{value}</span>;
    },
    width: 100,
    style: styles.cell
  }];
}


function renderMtss(mtssList, nowMoment) {
  if (mtssList.length === 0) return null;

  // this school year and 2 years back
  const startOfSchoolYearMoment = firstDayOfSchool(toSchoolYear(nowMoment.toDate()) - 2);
  const mtssMoments = mtssList.map(mtss => toMomentFromRailsDate(mtss.recorded_at));
  const mtssMomentsThisYear = mtssMoments.filter(mtssMoment => mtssMoment.isAfter(startOfSchoolYearMoment));
  const latestMtssMoment = _.last(mtssMomentsThisYear.sort());
  if (!latestMtssMoment) return null;

  // const text = nowMoment.diff(toMomentFromRailsDate(mtss.recorded_at), 'days');
  return <a href="#">{latestMtssMoment.format('M/D/YY')}</a>;
}
