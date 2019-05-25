import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import * as Routes from '../helpers/Routes';
import {toMomentFromRailsDate} from '../helpers/toMoment';
import {eventNoteTypeText} from '../helpers/eventNoteType';
import BoxCard from '../components/BoxCard';
import SectionHeading from '../components/SectionHeading';
import WordCloud from '../components/WordCloud';
import NoteCard from '../student_profile/NoteCard';
import {urlForRestrictedEventNoteContent} from '../student_profile/RestrictedNotePresence';


export default class NotesFeed extends React.Component {
  render() {
    const {eventNotes} = this.props;
    return (
      <div className="NotesFeed" style={styles.root}>
        <SectionHeading>My notes</SectionHeading>
        <div style={styles.subTitle}>Showing {eventNotes.length} notes</div>
        <div className="feed" style={styles.feed}>
          <div style={styles.leftColumn} className="notes-list">
            {this.renderNotesList()}
          </div>
          <div style={styles.rightColumn}>
            {this.renderSidebar()}
          </div>
        </div>
          {this.renderFooter()}
      </div>
    );
  }

  renderNotesList() {
    const {eventNotes} = this.props;

    return (
      <div>
        {eventNotes.map(eventNoteWithStudent => {
          const {student} = eventNoteWithStudent;
          return (
            <div key={eventNoteWithStudent.id} className="wrapper" style={styles.wrapper}>
              {this.renderStudentCard(student)}
              {this.renderEventNote(eventNoteWithStudent, student)}
            </div>
          );
        })}
      </div>
    );
  }

  // Readonly, but let people view restricted note redactions if they
  // have access.  Need to factor this out so it can either take all the
  // pieces from the student profile, or be untangled from that complexity.
  renderEventNote(eventNote, student) {
    const {educator, canUserAccessRestrictedNotes} = this.props;
    const isRedacted = eventNote.is_restricted;
    const urlForRestrictedNoteContent = (canUserAccessRestrictedNotes && isRedacted)
      ? urlForRestrictedEventNoteContent(eventNote)
      : null;
    return (
      <NoteCard
        key={['event_note', eventNote.id].join()}
        noteMoment={toMomentFromRailsDate(eventNote.recorded_at)}
        badgeEl={eventNoteTypeText(eventNote.event_note_type_id)}
        educator={educator}
        text={eventNote.text || ''}
        lastRevisedAtMoment={eventNote.latest_revision_at ? toMomentFromRailsDate(eventNote.latest_revision_at) : null}
        attachments={eventNote.attachments}
        showRestrictedNoteRedaction={isRedacted}
        urlForRestrictedNoteContent={urlForRestrictedNoteContent}
      />
    );
  }

  renderHomeroomOrGrade(student) {
    if (student.grade < 9) {
      if (student.homeroom_id) {
        return (
          <p><a
            className="homeroom-link"
            href={Routes.homeroom(student.homeroom_id)}>
            {'Homeroom ' + student.homeroom_name}
          </a></p>
        );
      }
      else {
        return (
          <p>No Homeroom</p>
        );
      }
    }
    else {
      return (
        <p>{student.grade}th Grade</p>
      );
    }
  }

  renderSchool(student) {
    if (student.school_id) {
      return (
        <p><a
          className="school-link"
          href={Routes.school(student.school_id)}>
          {student.school_name}
        </a></p>
      );
    }
    else {
      return (
        <p>No School</p>
      );
    }
  }

  renderStudentCard(student) {
    return (
      <div className="studentCard" style={styles.studentCard}>
        <p><a style={styles.studentName} href={Routes.studentProfile(student.id)}>
          {student.last_name}, {student.first_name}
        </a></p>
        {this.renderSchool(student)}
        {this.renderHomeroomOrGrade(student)}
      </div>
    );
  }

  renderSidebar() {
    const {showWordCloud, eventNotes} = this.props;
    if (!showWordCloud && window.location.search.indexOf('wordcloud') === -1) return null;
    
    const words = wordsFromEventNotes(eventNotes);
    return (
      <div style={styles.flexVertical}>
        <BoxCard title="Most common words" style={{marginTop: 10}}>
          <WordCloud
            width={400}
            height={400}
            words={words}
          />
        </BoxCard>
      </div>
    );
  }

  renderFooter() {
    if (this.props.eventNotes.length != this.props.totalNotesCount) {
      return (
        <div className="footer" style={styles.footer}>
          <button
            className="btn load-more-notes"
            style={styles.button}
            onClick={this.props.onClickLoadMoreNotes}>
            Load 30 More Notes
          </button>
        </div>
      );
    }
  }
}
NotesFeed.propTypes = {
  educator: PropTypes.object.isRequired,
  canUserAccessRestrictedNotes: PropTypes.bool.isRequired,
  totalNotesCount: PropTypes.number.isRequired,
  eventNotes: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClickLoadMoreNotes: PropTypes.func.isRequired,
  showWordCloud: PropTypes.bool
};


const styles = {
  root: {
    fontSize: 14,
    margin: 10
  },
  wrapper: {
    display: 'flex'
  },
  button: {
    marginTop: '10px',
    display: 'inline'
  },
  feed: {
    display: 'flex',
    flexDirection: 'row',
    margin: 10
  },
  leftColumn: {
    flex: 2
  },
  rightColumn: {
    paddingLeft: 20,
    flex: 1
  },
  footer: {
    margin: '5% 41%'
  },
  subTitle: {
    margin: 10,
    marginTop: 20,
    color: '#aaa'
  },
  studentCard: {
    border: '1px solid #eee',
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
    width: '25%'
  },
  studentName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#3177c9',
    marginBottom: '5%'
  }
};


// Quick and dirty grabbing the list of words
function wordsFromEventNotes(eventNotes) {
  return _.flatMap(eventNotes, eventNote => {
    return eventNote.text.split(' ');
  });
}
