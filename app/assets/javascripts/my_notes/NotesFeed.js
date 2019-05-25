import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import * as Routes from '../helpers/Routes';
import {toMomentFromRailsDate} from '../helpers/toMoment';
import {eventNoteTypeText} from '../helpers/eventNoteType';
import BoxCard from '../components/BoxCard';
import Card from '../components/Card';
import SectionHeading from '../components/SectionHeading';
import WordCloud from '../components/WordCloud';
import NoteCard from '../student_profile/NoteCard';
import {urlForRestrictedEventNoteContent} from '../student_profile/RestrictedNotePresence';

import Educator from '../components/Educator';
import HouseBadge from '../components/HouseBadge';
import NoteBadge from '../components/NoteBadge';
import Timestamp from '../components/Timestamp';
import {FrameHeader} from '../feed/FeedCardFrame';
import EventNoteCard from '../feed/EventNoteCard';



export default class NotesFeed extends React.Component {
  render() {
    const {eventNotes} = this.props;
    return (
      <div className="NotesFeed" style={styles.root}>
        <SectionHeading>My notes</SectionHeading>
        <div style={styles.subTitle}>Showing {eventNotes.length} notes</div>
        <div className="feed" style={styles.feed}>
          <div style={styles.leftColumn} className="notes-list">
            {this.renderAgain()}
          </div>
          <div style={styles.rightColumn}>
            {this.renderSidebar()}
          </div>
        </div>
          {this.renderFooter()}
      </div>
    );
  }

  renderAgain() {
    const {eventNotes} = this.props;

    return (
      <div>
        {eventNotes.map(eventNoteWithStudent => {
          const {student} = eventNoteWithStudent;
          return (
            <EventNoteCard
              key={eventNoteWithStudent.id}
              style={styles.card}
              eventNoteCardJson={eventNoteWithStudent}>
              {this.renderEventNote(eventNoteWithStudent, student)}
            </EventNoteCard>
          );

          // return (
          //   <Card key={eventNoteWithStudent.id} style={styles.card}>
          //     <CardFrame
          //       student={student}
          //       eventNote={eventNoteWithStudent}
          //       educator={educator}
          //     />
          //     {this.renderEventNote(eventNoteWithStudent, student)}
          //   </Card>
          // );
        })}
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
            <div key={eventNoteWithStudent.id} style={styles.wrapper}>
              {this.renderStudentCard(eventNoteWithStudent, student)}
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
        withoutShell={true}
      />
    );
  }

  // renderHomeroomOrGrade(student) {
  //   if (student.grade < 9) {
  //     if (student.homeroom_id) {
  //       return (
  //         <p><a
  //           className="homeroom-link"
  //           href={Routes.homeroom(student.homeroom_id)}>
  //           {'Homeroom ' + student.homeroom_name}
  //         </a></p>
  //       );
  //     }
  //     else {
  //       return (
  //         <p>No Homeroom</p>
  //       );
  //     }
  //   }
  //   else {
  //     return (
  //       <p>{student.grade}th Grade</p>
  //     );
  //   }
  // }

  // renderSchool(student) {
  //   if (student.school_id) {
  //     return (
  //       <p><a
  //         className="school-link"
  //         href={Routes.school(student.school_id)}>
  //         {student.school_name}
  //       </a></p>
  //     );
  //   }
  //   else {
  //     return (
  //       <p>No School</p>
  //     );
  //   }
  // }

  // renderStudentCard(eventNote, student) {
  //   return (
  //     <div style={styles.studentCard}>
  //       <p><a style={styles.studentName} href={Routes.studentProfile(student.id)}>
  //         {student.last_name}, {student.first_name}
  //       </a></p>
  //       {this.renderSchool(student)}
  //       {this.renderHomeroomOrGrade(student)}
  //     </div>
  //   );
  // }

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
        <div style={styles.footer}>
          <button
            className="btn"
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
  card: {
    marginTop: 20
  },
  wrapper: {
    display: 'flex'
  },
  button: {
    marginTop: 10,
    display: 'inline'
  },
  feed: {
    display: 'flex',
    flexDirection: 'row',
    margin: 10
  },
  leftColumn: {
    flex: 1
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
    width: 250
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3177c9',
    marginBottom: '5%'
  },
  person: {
    fontWeight: 'bold'
  }
};


// Quick and dirty grabbing the list of words
function wordsFromEventNotes(eventNotes) {
  return _.flatMap(eventNotes, eventNote => {
    return eventNote.text.split(' ');
  });
}




function CardFrame(props) {
  const {student, educator, eventNote} = props;
  return (
    <FrameHeader
      student={student}
      byEl={
        <div>
          <span>by </span>
          <Educator
            style={styles.person}
            educator={educator} />
        </div>
      }
      whereEl={<div>in {eventNoteTypeText(eventNote.event_note_type_id)}</div>}
      whenEl={<Timestamp railsTimestamp={eventNote.recorded_at} />}
      badgesEl={<div>
        {student.house && <HouseBadge style={styles.footerBadge} house={student.house} />}
        <NoteBadge style={styles.footerBadge} eventNoteTypeId={eventNote.event_note_type_id} />
      </div>
      }
    />
  );
}
CardFrame.propTypes = {
  student: PropTypes.object.isRequired,
  educator: PropTypes.object.isRequired,
  eventNote: PropTypes.object.isRequired
};
