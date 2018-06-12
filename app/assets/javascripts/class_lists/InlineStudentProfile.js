import PropTypes from 'prop-types';
import React from 'react';
import SectionHeading from '../components/SectionHeading';
import GenericLoader from '../components/GenericLoader';
import Card from '../components/Card';
import FeedView from '../feed/FeedView';
import {isLimitedOrFlep} from './studentFilters';

// Inline student profile for classroom list creator, shown as a modal
export default class InlineStudentProfile extends React.Component {
  render() {
    const {student} = this.props;
    return (
      <div className="InlineStudentProfile" style={styles.root}>
        <h4>
          <a style={{fontSize: 24}} href={`/students/${student.id}`} target="_blank">{student.first_name} {student.last_name}</a>
        </h4>
        <div style={styles.columns}>
          <div style={styles.column}>
            <div style={{display: 'flex'}}>
              <Card style={styles.card}>
                <div style={styles.header}>Special needs</div>
                {student.disability &&
                  <div>Disability: {student.disability} 
                    {student.iep_document && <span> (<a href={`/iep_documents/${student.iep_document.id}`} target="_blank">IEP</a>)</span>}
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
                {student.latest_dibels && <div>DIBELS: {student.latest_dibels.performance_level}</div>}
                {student.most_recent_star_math_percentile && <div>STAR Math percentile: {student.most_recent_star_math_percentile}</div>}
                {student.most_recent_star_reading_percentile && <div>STAR Reading percentile: {student.most_recent_star_reading_percentile}</div>}
              </Card>
              <Card style={styles.card}>
                <div style={styles.header}>Behavior</div>
                <div>Discipline incidents: {student.most_recent_school_year_discipline_incidents_count}</div>
              </Card>
            </div>
          </div>
          <div style={styles.column}>
            {this.renderFeed()}
          </div>
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
    margin: 20
  },
  columns: {
    marginTop: 20,
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