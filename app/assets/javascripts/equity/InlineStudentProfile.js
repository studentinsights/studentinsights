import React from 'react';
import _ from 'lodash';
import SectionHeading from '../components/SectionHeading';
import GenericLoader from '../components/GenericLoader';
import FeedView from '../feed/FeedView';


// Inline student profile for classroom list creator, shown as a modal
export default class InlineStudentProfile extends React.Component {
  render() {
    const {student} = this.props;
    return (
      <div className="InlineStudentProfile">
        <h4><a style={{fontSize: 20}} href={`/students/${student.id}`} target="_blank">{student.first_name} {student.last_name}</a></h4>
        <div style={styles.columns}>
          <div style={styles.column}>
            <div>Disability: {student.disability}</div>
            <div>Program: {student.program_assigned}</div>
            <div>504 plan: {student.plan_504}</div>
            <div>Learning English: {student.limited_english_proficiency}</div>
            <div>Most recent ACCESS: <pre>{JSON.stringify(_.last(student.latest_access_results), null, 2)}</pre></div>
            <div>Home language: {student.home_language}</div>
            <br />
            <div>Free reduced lunch: {student.free_reduced_lunch}</div>
            <div>Race: {student.race}</div>
            <div>Hispanic: {student.hispanic_latino ? 'yes' : 'no'}</div>
            <div>Gender: {student.gender}</div>
            <br />
            <div>Most recent DIBELS: {student.latest_dibels && student.latest_dibels.performance_level}</div>
            <div>Most recent STAR Math percentile: {student.most_recent_star_math_percentile}</div>
            <div>Most recent STAR Reading percentile: {student.most_recent_star_reading_percentile}</div>
          </div>
          <div style={styles.column}>
            {this.renderNotes()}
          </div>
        </div>
      </div>
    );
  }

  // TODO(kr) refactor
  renderNotes() {
    const {student, fetchProfile} = this.props;
    return (
      <div>
        <SectionHeading>Notes for {student.first_name}</SectionHeading>
        <GenericLoader
          promiseFn={() => fetchProfile(student.id)}
          render={this.renderFeed.bind(this)} />
      </div>
    );
  }

  renderFeed(json) {
    return <FeedView feedCards={json.feed_cards} />;
  }

  // // TODO(kr) refactor
  // renderNotesFeed(json) {
  //   const {student} = this.props;
  //   const feed = {
  //     event_notes: student.event_notes_without_restricted,
  //     services: {
  //       active: [],
  //       discontinued: []
  //     },
  //     deprecated: {
  //       interventions: []
  //     }
  //   };

  //   // TODO(kr) module
  //   return (
  //     <window.shared.NotesList
  //       feed={feed}
  //       educatorsIndex={json.educators_index}
  //       eventNoteTypesIndex={json.event_note_types_index} />
  //   );
  // }
}
InlineStudentProfile.propTypes = {
  fetchProfile: React.PropTypes.func.isRequired,
  student: React.PropTypes.object.isRequired
};

const styles = {
  columns: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'column'
  },
  column: {
    flex: 1,
  }
};