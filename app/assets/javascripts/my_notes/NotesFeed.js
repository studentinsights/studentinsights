import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {toMomentFromRailsDate} from '../helpers/toMoment';
import {eventNoteTypeText} from '../helpers/eventNoteType';
import BoxCard from '../components/BoxCard';
import SectionHeading from '../components/SectionHeading';
import WordCloud from '../components/WordCloud';
import EventNoteCard from '../feed/EventNoteCard';
import {urlForRestrictedEventNoteContent} from '../student_profile/RestrictedNotePresence';
import NoteCard from '../student_profile/NoteCard';

// Shows the feed of notes
export default class NotesFeed extends React.Component {
  render() {
    const {mixedEventNotes} = this.props;
    return (
      <div className="NotesFeed" style={styles.root}>
        <SectionHeading>My notes</SectionHeading>
        <div style={styles.subTitle}>Showing {mixedEventNotes.length} notes</div>
        <div className="feed" style={styles.feed}>
          <div style={styles.leftColumn} className="notes-list">
            {this.renderNotes()}
          </div>
          <div style={styles.rightColumn}>
            {this.renderSidebar()}
          </div>
        </div>
          {this.renderFooter()}
      </div>
    );
  }

  // Provide an alternate "substance" to <EventNoteCard />
  renderNotes() {
    const {mixedEventNotes} = this.props;
    return (
      <div>
        {mixedEventNotes.map(mixedEventNote => {
          return (
            <EventNoteCard
              key={mixedEventNote.id}
              style={styles.card}
              eventNoteCardJson={mixedEventNote}>
              {this.renderEventNoteCard(mixedEventNote, mixedEventNote.student, mixedEventNote.educator)}
            </EventNoteCard>
          );
        })}
      </div>
    );
  }

  // Readonly, but let people view restricted note redactions if they
  // have access.
  // This requires `eventNote` not just the json from the card.
  renderEventNoteCard(eventNote, student, educator) {
    const {canUserAccessRestrictedNotes} = this.props;
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
        substanceOnly={true} // no shell
      />
    );
  }

  renderSidebar() {
    const {showWordCloud, mixedEventNotes} = this.props;
    if (!showWordCloud && window.location.search.indexOf('wordcloud') === -1) return null;
    
    const words = wordsFromEventNotes(mixedEventNotes);
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
    const {mixedEventNotes, totalNotesCount, onClickLoadMoreNotes} = this.props;
    if (mixedEventNotes.length != totalNotesCount) {
      return (
        <div style={styles.footer}>
          <button
            className="btn"
            style={styles.button}
            onClick={onClickLoadMoreNotes}>
            Load 30 More Notes
          </button>
        </div>
      );
    }
  }
}
NotesFeed.propTypes = {
  canUserAccessRestrictedNotes: PropTypes.bool.isRequired,
  mixedEventNotes: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalNotesCount: PropTypes.number.isRequired,  
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




