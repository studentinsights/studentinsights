import PropTypes from 'prop-types';
import React from 'react';
import SectionHeading from '../components/SectionHeading';
import GenericLoader from '../components/GenericLoader';
import Card from '../components/Card';
import StudentPhotoCropped from '../components/StudentPhotoCropped';
import FeedView from '../feed/FeedView';
import {isLimitedOrFlep} from './studentFilters';
import {HighlightKeys} from './studentFilters';
import {highlightStyleForKey, userFacingValueForKey} from './highlights';

// Inline student profile for classroom list creator, shown as a modal
export default class InlineStudentProfile extends React.Component {
  render() {
    const {student} = this.props;
    return (
      <div className="InlineStudentProfile" style={styles.root}>
        <h4 style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
            <StudentPhotoCropped studentId={student.id} />
            <a style={{fontSize: 24, fontWeight: 'bold'}} href={`/students/${student.id}`} target="_blank" rel="noopener noreferrer">{student.first_name} {student.last_name}</a>
          </div>
          <a style={{fontSize: 12}} href={`/students/${student.id}`} target="_blank" rel="noopener noreferrer">Open full profile</a>
        </h4>
        <div style={styles.columns}>
          {this.renderSimpleColumn()}
          <div style={{...styles.column, marginTop: 20}}>
            {this.renderFeed()}
          </div>
        </div>
      </div>
    );
  }

  renderSimpleColumn() {
    // TODO(kr)
    const {student} = this.props;
    const showStar = (['KF', '1'].indexOf(student.grade) === -1);
    const showDibels = !showStar;

    return (
      <div style={{...styles.column, marginTop: 10, fontSize: 12}}>
        <SectionHeading>Equity checks</SectionHeading>
        <div style={{display: 'flex', flexDirection: 'row', marginLeft: 10, marginRight: 10}}>
          {this.renderHeaderCell({
            label: 'IEP or 504',
            columnHighlightKey: HighlightKeys.IEP_OR_504,
            title: 'Students who have an IEP or 504 plan.'
          })}
          {this.renderHeaderCell({
            label: 'Limited or FLEP',
            columnHighlightKey: HighlightKeys.LIMITED_OR_FLEP,
            title: 'Students receiving English Learning Services or who have in the past (FLEP).'
          })}
          {this.renderHeaderCell({
            label: 'Gender identity',
            columnHighlightKey: HighlightKeys.GENDER,
            title: 'Students broken down by whether they identify their gender as male, female or nonbinary.'
          })}
          {this.renderHeaderCell({
            label: 'Reduced lunch',
            columnHighlightKey: HighlightKeys.LOW_INCOME,
            title: 'Students whose are enrolled in the free or reduced lunch program.'
          })}
          {this.renderHeaderCell({
            label: 'Discipline, 3+',
            columnHighlightKey: HighlightKeys.HIGH_DISCIPLINE,
            title: 'Students who had three or more discipline incidents of any kind during this past school year.  Discipline incidents vary in severity; click on the student\'s name to see more in their profile.'
          })}
          {showDibels && this.renderHeaderCell({
            label: 'Dibels CORE',
            columnHighlightKey: HighlightKeys.DIBELS,
            title: 'Students\' latest DIBELS scores, broken down into Core (green), Strategic (orange) and Intensive (red).'
          })}
          {showStar && this.renderHeaderCell({
            label: 'STAR Math',
            columnHighlightKey: HighlightKeys.STAR_MATH,
            title: 'A boxplot showing the range of students\' latest STAR Math percentile scores.  The number represents the median score.  When clicking, green represents students above the 70th percentile and red represents students below the 30th percentile.'
          })}
          {showStar && this.renderHeaderCell({
            label: 'STAR Reading',
            columnHighlightKey: HighlightKeys.STAR_READING,
            title: 'A boxplot showing the range of students\' latest STAR Reading percentile scores.  The number represents the median score.  When clicking, green represents students above the 70th percentile and red represents students below the 30th percentile.'
          })}
        </div>
      </div>
    );
  }

  renderHeaderCell(params) {
    const {student} = this.props;
    const {label, columnHighlightKey, title} = params;
    const highlightStyle = highlightStyleForKey(student, columnHighlightKey);
    return (
      <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        <div style={{flex: 1, padding: 5, paddingBottom: 0}} title={title}>{label}</div>
        <div style={{...highlightStyle, margin: 5, padding: 5, textAlign: 'center'}}>
          {userFacingValueForKey(student, columnHighlightKey)}
        </div>
      </div>
    );
  }

  renderSummaryColumn() {
    const {student} = this.props;
    return (
      <div style={styles.column}>
        <div style={{display: 'flex'}}>
          <Card style={styles.card}>
            <div style={styles.header}>Special needs</div>
            {student.disability &&
              <div>Disability: {student.disability}
                {student.latest_iep_document && <span> (<a href={`/students/${student.id}/latest_iep_document`} target="_blank">IEP</a>)</span>}
              </div>
            }
            {student.sped_level_of_need && <div>Level of need: {student.sped_level_of_need}</div>}
            {student.program_assigned && <div>Program: {student.program_assigned}</div>}
            {student.plan_504 === '504' && <div>504 plan: {student.plan_504}</div>}
          </Card>
          <Card style={styles.card}>
            <div style={styles.header}>Learning English</div>
            {isLimitedOrFlep(student) && <div>Learning English: {student.limited_english_proficiency}</div>}
            {student.latest_access_results && <div>ACCESS Composite: {student.latest_access_results.composite}</div>}
          </Card>
        </div>
        <div style={{display: 'flex'}}>
          <Card style={styles.card}>
            <div style={styles.header}>Identity</div>
            <div>Racial identity: {student.race}</div>
            <div>Hispanic: {student.hispanic_latino ? 'Hispanic' : 'Not hispanic'}</div>
            <div>Gender: {student.gender}</div>
          </Card>
          <Card style={styles.card}>
            <div style={styles.header}>Home</div>
            <div>Home language: {student.home_language}</div>
            {student.free_reduced_lunch && <div>Free or reduced lunch: {student.free_reduced_lunch}</div>}
          </Card>
        </div>
        <div style={{display: 'flex'}}>
          <Card style={styles.card}>
            <div style={styles.header}>Standardized tests</div>
            {student.latest_dibels && <div>DIBELS: {student.latest_dibels.benchmark}</div>}
            {student.most_recent_star_math_percentile && <div>STAR Math percentile: {student.most_recent_star_math_percentile}</div>}
            {student.most_recent_star_reading_percentile && <div>STAR Reading percentile: {student.most_recent_star_reading_percentile}</div>}
          </Card>
          <Card style={styles.card}>
            <div style={styles.header}>Behavior</div>
            <div>Discipline incidents: {student.most_recent_school_year_discipline_incidents_count}</div>
          </Card>
        </div>
      </div>
    );
  }

  renderFeed() {
    const {student, fetchProfile} = this.props;
    return (
      <div style={styles.feed}>
        <SectionHeading>Notes for {student.first_name}</SectionHeading>
        <GenericLoader
          promiseFn={() => fetchProfile(student.id)}
          render={this.renderFeedWithData.bind(this)} />
      </div>
    );
  }

  renderFeedWithData(json) {
    return <FeedView feedCards={json.feed_cards} />;
  }
}
InlineStudentProfile.propTypes = {
  fetchProfile: PropTypes.func.isRequired,
  student: PropTypes.object.isRequired
};

const styles = {
  root: {
    margin: 20,
    fontSize: 14
  },
  columns: {
  },
  column: {
  },
  header: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5
  },
  card: {
    flex: 1,
    margin: 5
  },
  feed: {
    paddingTop: 20
  }
};