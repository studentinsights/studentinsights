import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';
import {alwaysShowVerticalScrollbars} from '../helpers/globalStylingWorkarounds';
import * as InsightsPropTypes from '../helpers/InsightsPropTypes';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import * as FeedHelpers from '../helpers/FeedHelpers';
import {isStudentActive, shouldUseStarData} from '../helpers/PerDistrict';
import ReaderProfileJunePage from '../reader_profile/ReaderProfileJunePage';
import LightProfileHeader from './LightProfileHeader';
import LightProfileTab, {LightShoutNumber} from './LightProfileTab';
import LightAttendanceDetails from './LightAttendanceDetails';
import LightBehaviorDetails from './LightBehaviorDetails';
import ElaDetails from './ElaDetails';
import MathDetails from './MathDetails';
import LightNotesDetails from './LightNotesDetails';
import LightServiceDetails from './LightServiceDetails';
import LightNotesHelpContext from './LightNotesHelpContext';
import StudentSectionsRoster from './StudentSectionsRoster';
import ReflectionsAboutGrades from './ReflectionsAboutGrades';
import {tags} from './lightTagger';
import DetailsSection from './DetailsSection';
import FullCaseHistory from './FullCaseHistory';
import testingColumnTexts, {interpretEla, interpretMath} from './testingColumnTexts';


// Prototype of profile v3
const DAYS_AGO = 45;
export default class LightProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isTakingNotes: false,
      isWritingTransitionNote: false
    };

    this.onTakingNotesChanged = this.onTakingNotesChanged.bind(this);
    this.onWritingTransitionNoteChanged = this.onWritingTransitionNoteChanged.bind(this);
  }

  componentDidMount() {
    alwaysShowVerticalScrollbars();
  }

  countEventsSince(events, daysBack) {
    const {nowFn} = this.context;
    const nowMoment = nowFn();
    return countEventsSince(nowMoment, events, daysBack);
  }

  onColumnClicked(columnKey) {
    const {isTakingNotes} = this.state;

    if (isTakingNotes) {
      const shouldDiscardNote = confirm("You have a note in progress.\n\nDiscard that note?");
      if (!shouldDiscardNote) return;
    }
    
    this.setState({isTakingNotes: false});
    this.props.actions.onColumnClicked(columnKey);
  }

  onTakingNotesChanged(isTakingNotes) {
    this.setState({isTakingNotes});
  }

  onWritingTransitionNoteChanged(isWritingTransitionNote) {
    this.setState({isWritingTransitionNote});
  }

  render() {
    const {student} = this.props.profileJson;
    const isHighSchool = (student.school_type === 'HS');
    
    return (
      <div className="LightProfilePage" style={styles.root}>
        {this.renderInactiveOverlay()}
        {this.renderHeader()}
        <div style={styles.tabsContainer}>
          <div style={styles.tabLayout}>{this.renderNotesColumn()}</div>
          {isHighSchool && <div style={styles.tabLayout}>{this.renderGradesColumn()}</div>}
          {isHighSchool && <div style={styles.tabLayout}>{this.renderTestingColumn()}</div>}
          {!isHighSchool && <div style={styles.tabLayout}>{this.renderReadingColumn()}</div>}
          {!isHighSchool && <div style={styles.tabLayout}>{this.renderMathColumn()}</div>}
          <div style={styles.tabLayout}>{this.renderAttendanceColumn()}</div>
          <div style={styles.tabLayout}>{this.renderBehaviorColumn()}</div>
        </div>
        <div style={styles.detailsContainer}>
          {this.renderSectionDetails()}
        </div>
      </div>
    );
  }

  renderInactiveOverlay() {
    const {districtKey} = this.context;
    const {student} = this.props.profileJson;
    const isActive = isStudentActive(districtKey, student);
    if (isActive) return null;

    return (
      <div className="LightProfilePage-inactive-overlay" style={styles.inactiveOverlay}>
        <div style={styles.inactiveOverlayMessage}>
          {student.first_name} is no longer actively enrolled
        </div>
      </div>
    );
  }

  renderHeader() {
    const {feed} = this.props;
    const {
      student,
      access,
      teams,
      profileInsights,
      iepDocument,
      currentEducator,
      edPlans
    } = this.props.profileJson;
    return (
      <LightProfileHeader
        currentEducator={currentEducator}
        student={student}
        access={access}
        teams={teams}
        iepDocument={iepDocument}
        profileInsights={profileInsights}
        activeServices={feed.services.active}
        edPlans={edPlans}
        renderFullCaseHistory={this.renderFullCaseHistory.bind(this)}
      />
    );
  }

  renderSectionDetails() {
    const {selectedColumnKey} = this.props;
    if (selectedColumnKey === 'grades') return this.renderGrades();
    if (selectedColumnKey === 'testing') return this.renderTesting();
    if (selectedColumnKey === 'reading') return this.renderReading();
    if (selectedColumnKey === 'math') return this.renderMath();
    if (selectedColumnKey === 'attendance') return this.renderAttendance();
    if (selectedColumnKey === 'behavior') return this.renderBehavior();
    return this.renderNotes();
  }

  renderNotesColumn() {
    return (window.location.search.indexOf('tags') !== -1)
      ? this.renderNotesColumnWithTags()
      : this.renderNotesColumnWithCount();
  }

  renderNotesColumnWithCount() {
    const {nowFn} = this.context;
    const {feed, selectedColumnKey} = this.props;
    const columnKey = 'notes';

    // Recent notes of any kind
    const recentMomentCutoff = nowFn().clone().subtract(DAYS_AGO, 'days');
    const mergedNotes = FeedHelpers.mergedNotes(feed);
    const recentNotes = mergedNotes.filter(mergedNote => {
      return toMomentFromTimestamp(mergedNote.sort_timestamp).isAfter(recentMomentCutoff);
    });
    return (
      <LightProfileTab
        style={styles.tab}
        isSelected={selectedColumnKey === columnKey}
        onClick={this.onColumnClicked.bind(this, columnKey)}
        intenseColor="#4A90E2"
        fadedColor="#ededed"
        text="Notes">
          <LightShoutNumber number={recentNotes.length}>
            <div>{recentNotes.length === 1 ? 'note taken' : 'notes taken'}</div>
            <div>last {DAYS_AGO} days</div>
          </LightShoutNumber>
        </LightProfileTab>
    );
  }

  renderNotesColumnWithTags() {
    const {nowFn} = this.context;
    const {feed, selectedColumnKey} = this.props;
    const columnKey = 'notes';
    const topRecentTags = findTopRecentTags(feed.event_notes, nowFn());

    return (
      <LightProfileTab
        style={styles.tab}
        isSelected={selectedColumnKey === columnKey}
        onClick={this.onColumnClicked.bind(this, columnKey)}
        intenseColor="#4A90E2"
        fadedColor="#ededed"
        text="Notes">
          {(topRecentTags.length === 0)
            ? <div>No recent keywords</div>
            : topRecentTags.map(tag => <div key={tag}>“{tag}”</div>)}
        </LightProfileTab>
    );
  }

  renderGradesColumn() {
    const {selectedColumnKey} = this.props;
    const {sections} = this.props.profileJson;
    const columnKey = 'grades';
    const strugglingSectionsCount = sections.filter(section => {
      if (section.grade_numeric === null) return false;
      return (section.grade_numeric < 69);
    }).length;

    return (
      <LightProfileTab
        style={styles.tab}
        isSelected={selectedColumnKey === columnKey}
        onClick={this.onColumnClicked.bind(this, columnKey)}
        intenseColor="#ff7f00"
        fadedColor="hsl(24, 100%, 92%)"
        text="Grades">
          <LightShoutNumber number={strugglingSectionsCount}>
            <div>courses with a D or F</div>
            <div>right now</div>
          </LightShoutNumber>
        </LightProfileTab>
    );
  }

  renderTestingColumn() {
    const {nowFn} = this.context;
    const {selectedColumnKey} = this.props;
    const {chartData} = this.props.profileJson;
    const columnKey = 'testing';

    const nowMoment = nowFn();
    const {scoreText, testText, dateText} = testingColumnTexts(nowMoment, chartData);
    return (
      <LightProfileTab
        style={styles.tab}
        isSelected={selectedColumnKey === columnKey}
        onClick={this.onColumnClicked.bind(this, columnKey)}
        intenseColor="#6A2987"
        fadedColor="hsl(237,80%,95%)"
        text="Testing">
          <LightShoutNumber number={scoreText}>
            <div>{testText}</div>
            <div>{dateText}</div>
          </LightShoutNumber>
        </LightProfileTab>
    );
  }

  renderReadingColumn() {
    const {districtKey} = this.context;
    return (shouldUseStarData(districtKey))
      ? this.renderReadingColumnAsStar()
      : this.renderReadingColumnAsMcas();
  }

  renderReadingColumnAsMcas() {
    const {nowFn} = this.context;
    const {chartData} = this.props.profileJson;
    const nowMoment = nowFn();
    const {scoreText, dateText} = interpretEla(nowMoment, chartData);
    return this.renderReadingColumnUI({
      number: scoreText,
      firstLine: 'MCAS ELA',
      secondLine: dateText
    });
  }

  renderReadingColumnAsStar() {
    const {nowFn} = this.context;
    const {chartData} = this.props.profileJson;
    const {nDaysText, percentileText} = latestStar(chartData.star_series_reading_percentile, nowFn());
    return this.renderReadingColumnUI({
      number: percentileText,
      firstLine: 'STAR percentile',
      secondLine: nDaysText
    });
  }

  // Just the UI, regardless of content
  renderReadingColumnUI({number, firstLine, secondLine}) {
    const {selectedColumnKey} = this.props;
    const columnKey = 'reading';
    return (
      <LightProfileTab
        style={styles.tab}
        isSelected={selectedColumnKey === columnKey}
        onClick={this.onColumnClicked.bind(this, columnKey)}
        intenseColor="#ff7f00"
        fadedColor="hsl(24, 100%, 92%)"
        text="Reading">
          <LightShoutNumber number={number}>
            <div>{firstLine}</div>
            <div>{secondLine}</div>
          </LightShoutNumber>
        </LightProfileTab>
    );
  }

  renderMathColumn() {
    const {districtKey} = this.context;
    return (shouldUseStarData(districtKey))
      ? this.renderMathColumnAsStar()
      : this.renderMathColumnAsMcas();
  }

  renderMathColumnAsMcas() {
    const {nowFn} = this.context;
    const {chartData} = this.props.profileJson;
    const nowMoment = nowFn();
    const {scoreText, dateText} = interpretMath(nowMoment, chartData);
    return this.renderMathColumnUI({
      number: scoreText,
      firstLine: 'MCAS Math',
      secondLine: dateText
    });
  }

  renderMathColumnAsStar() {
    const {nowFn} = this.context;
    const {chartData} = this.props.profileJson;
    const {nDaysText, percentileText} = latestStar(chartData.star_series_math_percentile, nowFn());
    return this.renderMathColumnUI({
      number: percentileText,
      firstLine: 'STAR percentile',
      secondLine: nDaysText
    });
  }

  // Just the UI
  renderMathColumnUI({number, firstLine, secondLine}) {
    const {selectedColumnKey} = this.props;
    const columnKey = 'math';
    return (
      <LightProfileTab
        style={styles.tab}
        isSelected={selectedColumnKey === columnKey}
        onClick={this.onColumnClicked.bind(this, columnKey)}
        intenseColor="#6A2987"
        fadedColor="hsl(237,80%,95%)"
        text="Math">
          <LightShoutNumber number={number}>
            <div>{firstLine}</div>
            <div>{secondLine}</div>
          </LightShoutNumber>
        </LightProfileTab>
    );
  }

  renderAttendanceColumn() {
    const {selectedColumnKey} = this.props;
    const {attendanceData} = this.props.profileJson;
    const columnKey = 'attendance';
    const count = this.countEventsSince(attendanceData.absences, DAYS_AGO);
    return (
      <LightProfileTab
        style={styles.tab}
        isSelected={selectedColumnKey === columnKey}
        onClick={this.onColumnClicked.bind(this, columnKey)}
        intenseColor="#c8326b"
        fadedColor="#f5e1e8"
        text="Attendance">
          <LightShoutNumber number={count}>
            <div>{count === 1 ? 'absence' : 'absences'}</div>
            <div>last {DAYS_AGO} days</div>
          </LightShoutNumber>
        </LightProfileTab>
    );
  }

  renderBehaviorColumn() {
    const {selectedColumnKey} = this.props;
    const {attendanceData} = this.props.profileJson;
    const columnKey = 'behavior';
    const count = this.countEventsSince(attendanceData.discipline_incidents, DAYS_AGO);

    return (
      <LightProfileTab
        style={styles.tab}
        isSelected={selectedColumnKey === columnKey}
        onClick={this.onColumnClicked.bind(this, columnKey)}
        intenseColor="#31AB39"
        fadedColor="hsl(120,80%,95%)"
        text="Behavior">
          <LightShoutNumber number={count}>
            <div>{count === 1 ? 'discipline incident' : 'discipline incidents'}</div>
            <div>last {DAYS_AGO} days</div>
          </LightShoutNumber>
        </LightProfileTab>
    );
  }

  renderNotes() {
    const {feed, actions, requests} = this.props;
    const {student, educatorsIndex, serviceTypesIndex, currentEducator} = this.props.profileJson;
    const {isTakingNotes, isWritingTransitionNote} = this.state;

    return (
      <div className="LightProfilePage-notes" style={{display: 'flex', flexDirection: 'row'}}>
        <LightNotesDetails
          isTakingNotes={isTakingNotes}
          onTakingNotesChanged={this.onTakingNotesChanged}
          isWritingTransitionNote={isWritingTransitionNote}
          onWritingTransitionNoteChanged={this.onWritingTransitionNoteChanged}
          student={student}
          educatorsIndex={educatorsIndex}
          currentEducator={currentEducator}
          feed={feed}
          actions={actions}
          requests={requests}
          helpContent={<LightNotesHelpContext />}
          helpTitle="What is a Note?"
          title="Notes"
        />
        <LightServiceDetails
          student={student}
          serviceTypesIndex={serviceTypesIndex}
          educatorsIndex={educatorsIndex}
          currentEducator={currentEducator}
          feed={feed}
          actions={actions}
          requests={requests} />
      </div>
    );
  }

  renderGrades() {
    const {sections, currentEducatorAllowedSections, gradesReflectionInsights} = this.props.profileJson;
    const hasSections = (sections && sections.length > 0);

    return (
      <div>
        <DetailsSection anchorId="sections-roster" className="roster" title="Sections">
          {hasSections
            ? <StudentSectionsRoster
                sections={sections}
                linkableSections={currentEducatorAllowedSections} />
            : <div>Not enrolled in any sections</div>}

        </DetailsSection>
        <ReflectionsAboutGrades gradesReflectionInsights={gradesReflectionInsights} />
      </div>
    );
  }

  renderTesting() {
    const {student, chartData} = this.props.profileJson;
    return (
      <div className="LightProfilePage-testing">
        <ElaDetails
          className="LightProfilePage-ela"
          studentGrade={student.grade}
          hideStar={true}
          chartData={chartData}
          dibels={[]}
          fAndPs={[]} />
        <MathDetails
          className="LightProfilePage-math"
          hideStar={true}
          chartData={chartData}
          studentGrade={student.grade} />
      </div>
    );
  }

  renderReading() {
    const {districtKey} = this.context;
    const {student, access, chartData, currentEducator, dibels, fAndPs} = this.props.profileJson;
    const showMinimalReadingData = currentEducator.labels.indexOf('profile_enable_minimal_reading_data') !== -1;
    const readerProfileEl = (showMinimalReadingData
      ? <ReaderProfileJunePage student={student} access={access} />
      : null
    );
    return (
      <ElaDetails
        className="LightProfilePage-ela"
        chartData={chartData}
        studentGrade={student.grade}
        hideStar={!shouldUseStarData(districtKey)}
        dibels={showMinimalReadingData ? dibels : []}
        fAndPs={showMinimalReadingData ? fAndPs : []}
        readerProfileEl={readerProfileEl}
      />
    );
  }

  renderMath() {
    const {districtKey} = this.context;
    const {student, chartData} = this.props.profileJson;
    return (
      <MathDetails
        className="LightProfilePage-math"
        chartData={chartData}
        studentGrade={student.grade}
        hideStar={!shouldUseStarData(districtKey)}
      />
    );
  }

  renderAttendance() {
    const {feed} = this.props;
    const {attendanceData, serviceTypesIndex} = this.props.profileJson;
    return (
      <LightAttendanceDetails
        className="LightProfilePage-attendance"
        absences={attendanceData.absences}
        tardies={attendanceData.tardies}
        activeServices={feed.services.active}
        serviceTypesIndex={serviceTypesIndex} />
    );
  }

  renderBehavior() {
    const {feed} = this.props;
    const {currentEducator, attendanceData, serviceTypesIndex} = this.props.profileJson;
    return (
      <LightBehaviorDetails
        className="LightProfilePage-behavior"
        disciplineIncidents={attendanceData.discipline_incidents}
        canViewFullHistory={currentEducator.can_view_restricted_notes}
        activeServices={feed.services.active}
        serviceTypesIndex={serviceTypesIndex} />
    );
  }

  renderFullCaseHistory() {
    const {feed} = this.props;
    const {student, chartData, dibels, attendanceData, serviceTypesIndex} = this.props.profileJson;
    return (
      <FullCaseHistory
        student={student}
        feed={feed}
        dibels={dibels}
        chartData={chartData}
        attendanceData={attendanceData}
        serviceTypesIndex={serviceTypesIndex}
      />
    );
  }
}
LightProfilePage.contextTypes = {
  nowFn: PropTypes.func.isRequired,
  districtKey: PropTypes.string.isRequired
};
LightProfilePage.propTypes = {
  // UI and network state
  selectedColumnKey: PropTypes.string.isRequired,
  requests: InsightsPropTypes.requests,
  actions: InsightsPropTypes.actions,

  // mutable data
  feed: PropTypes.object.isRequired,

  // static data
  profileJson: PropTypes.shape({
    educatorsIndex: PropTypes.object.isRequired,
    serviceTypesIndex: PropTypes.object.isRequired,
    currentEducator: PropTypes.shape({
      labels: PropTypes.arrayOf(PropTypes.string).isRequired,
      can_view_restricted_notes: PropTypes.bool.isRequired
    }).isRequired,
    student: PropTypes.object.isRequired,
    
    profileInsights: PropTypes.array.isRequired,
    gradesReflectionInsights: PropTypes.array.isRequired,
    dibels: PropTypes.array.isRequired,
    fAndPs: PropTypes.array.isRequired,
    chartData: PropTypes.shape({
      // ela
      most_recent_star_reading_percentile: PropTypes.number,
      most_recent_mcas_ela_scaled: PropTypes.number,
      most_recent_mcas_ela_growth: PropTypes.number,
      star_series_reading_percentile: PropTypes.array,
      mcas_series_ela_scaled: PropTypes.array,
      mcas_series_ela_growth: PropTypes.array,
      // math
      most_recent_star_math_percentile: PropTypes.number,
      most_recent_mcas_math_scaled: PropTypes.number,
      most_recent_mcas_math_growth: PropTypes.number,
      star_series_math_percentile: PropTypes.array,
      mcas_series_math_scaled: PropTypes.array,
      mcas_series_math_growth: PropTypes.array
    }),
    attendanceData: PropTypes.shape({
      discipline_incidents: PropTypes.array,
      tardies: PropTypes.array,
      absences: PropTypes.array
    }),
    access: PropTypes.object,
    teams: PropTypes.array.isRequired,
    iepDocument: PropTypes.object,
    sections: PropTypes.array,
    edPlans: PropTypes.array.isRequired,
    currentEducatorAllowedSections: PropTypes.array
  }).isRequired
};


const styles = {
  root: {
    fontSize: 14
  },
  inactiveOverlay: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    background: '#6669',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inactiveOverlayMessage: {
    background: 'white',
    padding: 50,
    fontWeight: 'bold',
    fontSize: 20,
    color: 'black'
  },
  tabsContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    margin: 20,
    flex: 1,
    height: 150
  },
  tabLayout: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  tab: {
    flex: 1,
    textAlign: 'center'
  },
  detailsContainer: {
    margin: 20
  }
};



function findTopRecentTags(eventNotes, nowMoment) {
  // this branching is for testing locally, where demo dates aren't realistic
  const thresholdInDays = (process.env.NODE_ENV === 'production') ? DAYS_AGO : 100000; // eslint-disable-line no-undef
  const recentNotes = eventNotes.filter(e => nowMoment.clone().diff(toMomentFromTimestamp(e.recorded_at), 'days') < thresholdInDays);
  const recentNotesText = recentNotes.map(e => e.text).join(' ');
  const recentTags = tags(recentNotesText);
  return recentTags.slice(0, 4);
}

export function countEventsSince(nowMoment, events, daysBack) {
  const endMoment = nowMoment.endOf('day');
  const startMoment = nowMoment.clone().subtract(daysBack, 'days').startOf('day');
  return events.filter(event => {
    return moment.utc(event.occurred_at).isBetween(startMoment, endMoment);
  }).length;
}


export function latestStar(starDataPoints, nowMoment) {
  const starDataPoint = _.last(_.sortBy(starDataPoints, dataPoint => toMomentFromTimestamp(dataPoint.date_taken).unix()));
  if (!starDataPoint) return {
    nDaysText: 'not yet taken',
    percentileText: '-'
  };

  const testMoment = toMomentFromTimestamp(starDataPoint.date_taken);
  const nDaysText = testMoment.from(nowMoment);

  const percentile = starDataPoint.percentile_rank;
  const percentileText = (percentile)
    ? percentileWithSuffix(percentile)
    : '-';
  return {nDaysText, percentileText};
}

function percentileWithSuffix(percentile) {
  const lastDigit = _.last(percentile.toString());
  const suffix = {
    1: 'st',
    2: 'nd',
    3: 'rd'
  }[lastDigit] || 'th';
  return `${percentile}${suffix}`;
}
