import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import {toMomentFromRailsDate} from '../helpers/toMoment';
import * as InsightsPropTypes from '../helpers/InsightsPropTypes';
import * as FeedHelpers from '../helpers/FeedHelpers';
import {eventNoteTypeText} from '../helpers/eventNoteType';
import {IDLE} from '../helpers/requestStates';
import {toSchoolYear, firstDayOfSchool} from '../helpers/schoolYear';
import NoteCard from './NoteCard';
import {parseAndReRender} from './transitionNoteParser';
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
      isViewingAllNotes: props.forceShowingAllNotes
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
            case 'fall_student_voice_surveys': return this.renderFallStudentVoiceSurvey(mergedNote);
            case 'homework_help_sessions': return this.renderHomeworkHelpSession(mergedNote);
            case 'flattened_forms': return this.renderFlattenedForm(mergedNote);
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
        student={eventNote.student} /* really only for my notes page */
        eventNoteTypeId={eventNote.event_note_type_id}
        noteMoment={moment.utc(eventNote.recorded_at)}
        badge={this.renderEventNoteTypeBadge(eventNote.event_note_type_id)}
        educatorId={eventNote.educator_id}
        text={eventNote.text || ''}
        lastRevisedAtMoment={eventNote.latest_revision_at ? moment.utc(eventNote.latest_revision_at) : null}
        attachments={isRedacted ? [] : eventNote.attachments}
        educatorsIndex={educatorsIndex}
        showRestrictedNoteRedaction={isRedacted}
        includeStudentPanel={includeStudentPanel}
        urlForRestrictedNoteContent={urlForRestrictedNoteContent}
        onSave={isReadonly ? null : onSaveNote}
        requestState={requestState}
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
    const {canUserAccessRestrictedNotes} = this.props;
    const isRedacted = transitionNote.is_restricted;
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

  renderFallStudentVoiceSurvey(fallStudentVoiceSurvey) {
    return (
      <NoteCard
        key={['fall_completed_survey', fallStudentVoiceSurvey.id].join()}
        noteMoment={toMomentFromRailsDate(fallStudentVoiceSurvey.form_timestamp)}
        badge={<span style={styles.badge}>What I want my teacher to know about me</span>}
        text={`💬 From the "What I want my teacher to know about me" student voice survey 💬\n\n${fallStudentVoiceSurvey.flat_text}`}
        educatorId={null}
        educatorsIndex={{}}
        showRestrictedNoteRedaction={false}
        urlForRestrictedNoteContent={null}
        attachments={[]} />
    );
  }

  renderHomeworkHelpSession(homeworkHelpSession) {
    const text = 'Went to homework help for ' + homeworkHelpSession.courses.map(course => course.course_description).join(' and ') + '.';
    return (
      <NoteCard
        key={['homework_help_session', homeworkHelpSession.id].join()}
        noteMoment={toMomentFromRailsDate(homeworkHelpSession.form_timestamp)}
        badge={<span style={styles.badge}>Homework Help</span>}
        educatorId={homeworkHelpSession.recorded_by_educator_id}
        text={text}
        educatorsIndex={this.props.educatorsIndex}
        showRestrictedNoteRedaction={false}
        urlForRestrictedNoteContent={null}
        attachments={[]} />
    );
  }

  renderFlattenedForm(flattenedForm) {
    return (
      <NoteCard
        key={['flattened_form', flattenedForm.id].join()}
        noteMoment={toMomentFromRailsDate(flattenedForm.form_timestamp)}
        badge={<span style={styles.badge}>{flattenedForm.form_title}</span>}
        text={`💬 From the "${flattenedForm.form_title}" student voice survey 💬\n\n${flattenedForm.text}`}
        educatorId={null}
        educatorsIndex={{}}
        showRestrictedNoteRedaction={false}
        urlForRestrictedNoteContent={null}
        attachments={[]} />
    );
  }

  renderCleanSlateMessage() {
    const {forceShowingAllNotes, defaultSchoolYearsBack} = this.props;
    const {isViewingAllNotes} = this.state;

    if (forceShowingAllNotes) return null;
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
  currentEducatorId: PropTypes.number.isRequired,
  feed: InsightsPropTypes.feed.isRequired,
  requests: InsightsPropTypes.requests,
  educatorsIndex: PropTypes.object.isRequired,
  includeStudentPanel: PropTypes.bool,
  canUserAccessRestrictedNotes: PropTypes.bool,
  onSaveNote: PropTypes.func,
  onEventNoteAttachmentDeleted: PropTypes.func,
  forceShowingAllNotes: PropTypes.bool,
  defaultSchoolYearsBack: PropTypes.shape({
    number: PropTypes.number.isRequired,
    textYears: PropTypes.string.isRequired
  })
};
NotesList.defaultProps = {
  forceShowingAllNotes: false,
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