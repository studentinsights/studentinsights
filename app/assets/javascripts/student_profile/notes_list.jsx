import _ from 'lodash';
import moment from 'moment';
import PropTypes from '../helpers/PropTypes';
import * as FeedHelpers from '../helpers/FeedHelpers';

(function() {
  window.shared || (window.shared = {});

  const NoteCard = window.shared.NoteCard;

  const styles = {
    noItems: {
      margin: 10
    },
    badge: {
      display: 'inline-block',
      background: '#eee',
      outline: '3px solid #eee',
      width: '10em',
      textAlign: 'center',
      marginLeft: 10,
      marginRight: 10
    }
  };

  /*
  Renders the list of notes.
  */
  window.shared.NotesList = React.createClass({
    displayName: 'NotesList',

    propTypes: {
      feed: PropTypes.feed.isRequired,
      educatorsIndex: React.PropTypes.object.isRequired,
      eventNoteTypesIndex: React.PropTypes.object.isRequired,
      onSaveNote: React.PropTypes.func.isRequired,
      onEventNoteAttachmentDeleted: React.PropTypes.func
    },

    render: function() {
      const mergedNotes = FeedHelpers.mergedNotes(this.props.feed);
      return (
        <div className="NotesList">
          {(mergedNotes.length === 0) ? <div style={styles.noItems}>
            No notes
          </div> : mergedNotes.map(function(mergedNote) {
            switch (mergedNote.type) {
            case 'event_notes': return this.renderEventNote(mergedNote);
            case 'deprecated_interventions': return this.renderDeprecatedIntervention(mergedNote);
            }
          }, this)}
        </div>
      );
    },

    renderEventNoteTypeBadge: function(eventNoteTypeId) {
      const eventNoteType = this.props.eventNoteTypesIndex[eventNoteTypeId];
      if (eventNoteType === undefined) return null;
      return (
        <span style={styles.badge}>
          {eventNoteType.name}
        </span>
      );
    },

    renderEventNote: function(eventNote) {
      return (
        <NoteCard
          key={['event_note', eventNote.id].join()}
          eventNoteId={eventNote.id}
          eventNoteTypeId={eventNote.event_note_type_id}
          noteMoment={moment.utc(eventNote.recorded_at)}
          badge={this.renderEventNoteTypeBadge(eventNote.event_note_type_id)}
          educatorId={eventNote.educator_id}
          text={eventNote.text || ''}
          numberOfRevisions={eventNote.event_note_revisions.length}
          attachments={eventNote.attachments}
          educatorsIndex={this.props.educatorsIndex}
          onSave={this.props.onSaveNote}
          onEventNoteAttachmentDeleted={this.props.onEventNoteAttachmentDeleted} />
      );
    },

    // TODO(kr) support custom intervention type
    // This assumes that the `end_date` field is not accurate enough to be worth splitting
    // this out into two note entries.
    renderDeprecatedIntervention: function(deprecatedIntervention) {
      return (
        <NoteCard
          key={['deprecated_intervention', deprecatedIntervention.id].join()}
          noteMoment={moment.utc(deprecatedIntervention.start_date_timestamp, 'MMMM-YY-DD')}
          badge={React.createElement("span", { style: styles.badge }, 'Old intervention')}
          educatorId={deprecatedIntervention.educator_id}
          text={_.compact([deprecatedIntervention.name, deprecatedIntervention.comment, deprecatedIntervention.goal]).join('\n')}
          educatorsIndex={this.props.educatorsIndex}
          // deprecated interventions have no attachments
          attachments={[]} />
      );
    },

  });
})();
