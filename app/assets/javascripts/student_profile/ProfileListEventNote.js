import React from 'react';
import PropTypes from 'prop-types';
import {toMomentFromRailsDate} from '../helpers/toMoment';
import * as InsightsPropTypes from '../helpers/InsightsPropTypes';
import NoteCard from './NoteCard';
import {IDLE} from '../helpers/requestStates';
import {urlForRestrictedEventNoteContent} from './RestrictedNotePresence';

// For the profile list only
export default class ProfileListEventNote extends React.Component {
  render() {
    const {
      eventNote,
      educatorsIndex,
      onSaveNote,
      onEventNoteAttachmentDeleted,
      canUserAccessRestrictedNotes,
      currentEducatorId,
      requests
    } = this.props;
    const isRedacted = eventNote.is_restricted;
    const isReadonly = (
      !onSaveNote ||
      !onEventNoteAttachmentDeleted ||
      (currentEducatorId !== eventNote.educator_id) ||
      isRedacted
    );
    const urlForRestrictedNoteContent = (canUserAccessRestrictedNotes)
      ? urlForRestrictedEventNoteContent(eventNote)
      : null;
    const requestState = (isReadonly || !requests)
      ? IDLE
      : requests.updateNote[eventNote.id];
    return (
      <NoteCard
        key={['event_note', eventNote.id].join()}
        eventNoteId={eventNote.id}
        eventNoteTypeId={eventNote.event_note_type_id}
        noteMoment={toMomentFromRailsDate(eventNote.recorded_at)}
        badge={this.renderEventNoteTypeBadge(eventNote.event_note_type_id)}
        educatorId={eventNote.educator_id}
        text={eventNote.text || ''}
        lastRevisedAtMoment={eventNote.latest_revision_at ? toMomentFromRailsDate(eventNote.latest_revision_at) : null}
        attachments={isRedacted ? [] : eventNote.attachments}
        educatorsIndex={educatorsIndex}
        showRestrictedNoteRedaction={isRedacted}
        urlForRestrictedNoteContent={urlForRestrictedNoteContent}
        onSave={isReadonly ? null : onSaveNote}
        requestState={requestState}
        onEventNoteAttachmentDeleted={isReadonly ? null : onEventNoteAttachmentDeleted} />
    );
  }
}
ProfileListEventNote.propTypes = {
  eventNote: PropTypes.object.isRequired,
  currentEducatorId: PropTypes.number.isRequired,
  requests: InsightsPropTypes.requests,
  educatorsIndex: PropTypes.object.isRequired,
  canUserAccessRestrictedNotes: PropTypes.bool,
  onSaveNote: PropTypes.func,
  onEventNoteAttachmentDeleted: PropTypes.func
};