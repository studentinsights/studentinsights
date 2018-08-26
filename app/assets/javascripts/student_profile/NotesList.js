import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import {toMomentFromRailsDate} from '../helpers/toMoment';
import * as InsightsPropTypes from '../helpers/InsightsPropTypes';
import * as FeedHelpers from '../helpers/FeedHelpers';
import {eventNoteTypeText} from '../helpers/eventNoteType';
import {toSchoolYear, firstDayOfSchool} from '../helpers/schoolYear';
import NoteCard from './NoteCard';
import {parseAndReRender} from './lightTransitionNotes';
import {urlForRestrictedEventNoteContent, urlForRestrictedTransitionNoteContent} from './RestrictedNotePresence';
import CleanSlateMessage from './CleanSlateMessage';


/*
Renders the list of notes, including the different types of notes (eg, deprecated
interventions, transition notes).
*/
export default class NotesList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isViewingAllNotes: false
    };
    this.onToggleCaseHistory = this.onToggleCaseHistory.bind(this);
  }

  filteredNotes(mergedNotes) {
    const {isViewingAllNotes} = this.state;
    if (isViewingAllNotes) return mergedNotes;

    const {nowFn} = this.context;
    const {defaultSchoolYearsBack} = this.props;
    const nowMoment = nowFn();
    const oldestSchoolYearToIncluce = toSchoolYear(nowMoment) - defaultSchoolYearsBack.number;
    const schoolYearsBackCutoffMoment = firstDayOfSchool(oldestSchoolYearToIncluce);
    return mergedNotes.filter(mergedNote => {
      return toMomentFromRailsDate(mergedNote.sort_timestamp).isAfter(schoolYearsBackCutoffMoment);
    });
  }

  onToggleCaseHistory() {
    const {isViewingAllNotes} = this.state;
    this.setState({isViewingAllNotes: !isViewingAllNotes});
  }

  render() {
    const {feed} = this.props;
    const filteredNotes = this.filteredNotes(FeedHelpers.mergedNotes(feed));
    return (
      <div className="NotesList">
        {(filteredNotes.length === 0)
          ? <div style={styles.noItems}>No notes</div>
          : filteredNotes.map(mergedNote => {
            switch (mergedNote.type) {
            case 'event_notes': return this.renderEventNote(mergedNote);
            case 'transition_notes': return this.renderTransitionNote(mergedNote);
            case 'deprecated_interventions': return this.renderDeprecatedIntervention(mergedNote);
            }
          })}
        {this.renderCleanSlateMessage()}
      </div>
    );
  }

  renderEventNoteTypeBadge(eventNoteTypeId) {
    return (
      <span style={styles.badge}>
        {eventNoteTypeText(eventNoteTypeId)}
      </span>
    );
  }

  renderEventNote(eventNote) {
    const {
      includeStudentPanel,
      educatorsIndex,
      onSaveNote,
      onEventNoteAttachmentDeleted,
      showRestrictedNoteContent,
      allowDirectEditingOfRestrictedNoteText,
      canUserAccessRestrictedNotes
    } = this.props;
    const isRedacted = eventNote.is_restricted && !showRestrictedNoteContent;
    const isReadonly = (
      !onSaveNote ||
      !onEventNoteAttachmentDeleted ||
      isRedacted ||
      (eventNote.is_restricted && !allowDirectEditingOfRestrictedNoteText)
    );
    const urlForRestrictedNoteContent = (canUserAccessRestrictedNotes)
      ? urlForRestrictedEventNoteContent(eventNote)
      : null;
    return (
      <NoteCard
        key={['event_note', eventNote.id].join()}
        eventNoteId={eventNote.id}
        student={eventNote.student} /* really only for my notes page */
        eventNoteTypeId={eventNote.event_note_type_id}
        noteMoment={moment.utc(eventNote.recorded_at)}
        badge={this.renderEventNoteTypeBadge(eventNote.event_note_type_id)}
        educatorId={eventNote.educator_id}
        text={eventNote.text || ''}
        numberOfRevisions={eventNote.event_note_revisions_count}
        attachments={isRedacted ? [] : eventNote.attachments}
        educatorsIndex={educatorsIndex}
        showRestrictedNoteRedaction={isRedacted}
        includeStudentPanel={includeStudentPanel}
        urlForRestrictedNoteContent={urlForRestrictedNoteContent}
        onSave={isReadonly ? null : onSaveNote}
        onEventNoteAttachmentDeleted={isReadonly ? null : onEventNoteAttachmentDeleted} />
    );
  }

  // TODO(kr) support custom intervention type
  // This assumes that the `end_date` field is not accurate enough to be worth splitting
  // this out into two note entries.
  renderDeprecatedIntervention(deprecatedIntervention) {
    return (
      <NoteCard
        key={['deprecated_intervention', deprecatedIntervention.id].join()}
        noteMoment={moment.utc(deprecatedIntervention.start_date_timestamp, 'MMMM-YY-DD')}
        badge={<span style={styles.badge}>Old intervention</span>}
        educatorId={deprecatedIntervention.educator_id}
        text={_.compact([deprecatedIntervention.name, deprecatedIntervention.comment, deprecatedIntervention.goal]).join('\n')}
        educatorsIndex={this.props.educatorsIndex}
        // deprecated interventions have no attachments
        attachments={[]} />
    );
  }

  renderTransitionNote(transitionNote) {
    const {showRestrictedNoteContent, canUserAccessRestrictedNotes} = this.props;
    const isRedacted = transitionNote.is_restricted && !showRestrictedNoteContent;
    const urlForRestrictedNoteContent = (canUserAccessRestrictedNotes)
      ? urlForRestrictedTransitionNoteContent(transitionNote)
      : null;
    return (
      <NoteCard
        key={['transition_note', transitionNote.id].join()}
        noteMoment={toMomentFromRailsDate(transitionNote.created_at)}
        badge={<span style={styles.badge}>Transition note</span>}
        educatorId={transitionNote.educator_id}
        text={parseAndReRender(transitionNote.text)}
        educatorsIndex={this.props.educatorsIndex}
        showRestrictedNoteRedaction={isRedacted}
        urlForRestrictedNoteContent={urlForRestrictedNoteContent}
        attachments={[]} />
    );
  }

  renderCleanSlateMessage() {
    const {defaultSchoolYearsBack} = this.props;
    const {isViewingAllNotes} = this.state;
    return (
      <CleanSlateMessage
        canViewFullHistory={true}
        isViewingFullHistory={isViewingAllNotes}
        onToggleVisibility={this.onToggleCaseHistory}
        xAmountOfDataText={`${defaultSchoolYearsBack.textYears} of data`}
      />
    );
  }
}
NotesList.propTypes = {
  feed: InsightsPropTypes.feed.isRequired,
  educatorsIndex: PropTypes.object.isRequired,
  includeStudentPanel: PropTypes.bool,
  showRestrictedNoteContent: PropTypes.bool,
  allowDirectEditingOfRestrictedNoteText: PropTypes.bool,
  allowViewingRestrictedNotes: PropTypes.bool,
  canUserAccessRestrictedNotes: PropTypes.bool,
  onSaveNote: PropTypes.func,
  onEventNoteAttachmentDeleted: PropTypes.func,
  defaultSchoolYearsBack: PropTypes.shape({
    number: PropTypes.number.isRequired,
    textYears: PropTypes.string.isRequired
  })
};
NotesList.defaultProps = {
  defaultSchoolYearsBack: {
    number: 1,
    textYears: 'one year'
  }
};
NotesList.contextTypes = {
  nowFn: PropTypes.func.isRequired
};

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

export const badgeStyle = styles.badge;