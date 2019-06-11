import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import {toMomentFromRailsDate} from '../helpers/toMoment';
import * as InsightsPropTypes from '../helpers/InsightsPropTypes';
import * as FeedHelpers from '../helpers/FeedHelpers';
import {IDLE} from '../helpers/requestStates';
import {eventNoteTypeText} from '../helpers/eventNoteType';
import NoteShell from '../components/NoteShell';
import NoteText from '../components/NoteText';
import Educator from '../components/Educator';
import NoteCard from './NoteCard';
import SecondTransitionNoteInline from './SecondTransitionNoteInline';
import {enableTransitionNoteDialog} from './SecondTransitionNoteDialog';
import {parseAndReRender} from './transitionNoteParser';
import BedfordTransitionSubstanceForProfile from './BedfordTransitionSubstanceForProfile';
import {fetchRestrictedTransitionNoteText, fetchRestrictedNoteText} from './RestrictedNotePresence';
import CleanSlateMessage, {defaultSchoolYearsBack, filteredNotesForCleanSlate} from './CleanSlateMessage';

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
    return filteredNotesForCleanSlate(mergedNotes, defaultSchoolYearsBack.number, nowFn);
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
            case 'second_transition_notes': return this.renderSecondTransitionNote(mergedNote);
            case 'deprecated_interventions': return this.renderDeprecatedIntervention(mergedNote);
            case 'fall_student_voice_surveys': return this.renderFallStudentVoiceSurvey(mergedNote);
            case 'homework_help_sessions': return this.renderHomeworkHelpSession(mergedNote);
            case 'flattened_forms': return this.renderFlattenedForm(mergedNote);
            case 'bedford_end_of_year_transitions': return this.renderBedfordEndOfYearTransition(mergedNote);
            }
          })}
        {this.renderCleanSlateMessage()}
      </div>
    );
  }

  renderEventNote(eventNote) {
    const {
      educatorsIndex,
      onSaveNote,
      onEventNoteAttachmentDeleted,
      canUserAccessRestrictedNotes,
      currentEducator,
      requests
    } = this.props;
    const isRedacted = eventNote.is_restricted;
    const isReadonly = (
      !onSaveNote ||
      !onEventNoteAttachmentDeleted ||
      (currentEducator.id !== eventNote.educator_id) ||
      isRedacted
    );
    const fetchRestrictedText = (canUserAccessRestrictedNotes)
      ? () => fetchRestrictedNoteText(eventNote)
      : null;
    const requestState = (isReadonly || !requests)
      ? IDLE
      : requests.updateNote[eventNote.id];
    return (
      <NoteCard
        key={['event_note', eventNote.id].join()}
        noteMoment={toMomentFromRailsDate(eventNote.recorded_at)}
        badgeEl={eventNoteTypeText(eventNote.event_note_type_id)}
        educator={educatorsIndex[eventNote.educator_id]}
        text={eventNote.text || ''}
        eventNoteId={eventNote.id}
        eventNoteTypeId={eventNote.event_note_type_id}
        lastRevisedAtMoment={eventNote.latest_revision_at ? toMomentFromRailsDate(eventNote.latest_revision_at) : null}
        attachments={isRedacted ? [] : eventNote.attachments}
        requestState={requestState}
        onSave={isReadonly ? null : onSaveNote}
        showRestrictedNoteRedaction={isRedacted}
        fetchRestrictedText={fetchRestrictedText}
        onEventNoteAttachmentDeleted={isReadonly ? null : onEventNoteAttachmentDeleted} />
    );
  }

  // Deprecated, see `SecondTransitionNote`
  renderTransitionNote(transitionNote) {
    const {canUserAccessRestrictedNotes, educatorsIndex} = this.props;
    const isRedacted = transitionNote.is_restricted;
    const fetchRestrictedText = (canUserAccessRestrictedNotes)
      ? () => fetchRestrictedTransitionNoteText(transitionNote)
      : null;
    
    return (
      <NoteCard
        key={['transition_note', transitionNote.id].join()}
        noteMoment={toMomentFromRailsDate(transitionNote.recorded_at)}
        badgeEl="Transition note"
        educator={educatorsIndex[transitionNote.educator_id]}
        text={parseAndReRender(transitionNote.text)}
        showRestrictedNoteRedaction={isRedacted}
        fetchRestrictedText={fetchRestrictedText}
        attachments={[]} />
    );
  }

  // Deprecated
  // This assumes that the `end_date` field is not accurate enough to
  // be worth splitting this out into two note entries.
  renderDeprecatedIntervention(deprecatedIntervention) {
    const {educatorsIndex} = this.props;
    const educator = educatorsIndex[deprecatedIntervention.educator_id];
    const noteMoment = moment.utc(deprecatedIntervention.start_date_timestamp, 'MMMM-YY-DD');
    const text = _.compact([deprecatedIntervention.name, deprecatedIntervention.comment, deprecatedIntervention.goal]).join('\n');
    return (
      <NoteShell
        key={['deprecated_intervention', deprecatedIntervention.id].join()}
        whenEl={noteMoment.format('MMMM D, YYYY')}
        badgeEl="Old intervention"
        educatorEl={<Educator educator={educator} />}
        substanceEl={<NoteText text={text} />}
      />
    );
  }

  renderSecondTransitionNote(secondTransitionNote) {
    const {educatorsIndex, currentEducator, student} = this.props;
    const educator = educatorsIndex[secondTransitionNote.educator_id];
    const allowEditing = enableTransitionNoteDialog(currentEducator, student) && (
      (currentEducator.labels.indexOf('enable_transition_note_editing') !== -1) ||
      (window.location.search.indexOf('enable_editing') !== -1)
    );
      
    return (
      <NoteShell
        key={['second_transition_note', secondTransitionNote.id].join()}
        whenEl={whenText(secondTransitionNote.recorded_at)}
        badgeEl="Transition note"
        educatorEl={<Educator educator={educator} />}
        substanceEl={
          <SecondTransitionNoteInline
            allowEditing={allowEditing}
            currentEducator={currentEducator}
            student={student}
            json={secondTransitionNote}
          />
        }
      />
    );
  }

  renderFallStudentVoiceSurvey(fallStudentVoiceSurvey) {
    const text = `💬 From the "What I want my teacher to know about me" student voice survey 💬\n\n${fallStudentVoiceSurvey.flat_text}`;
    return (
      <NoteShell
        key={['fall_completed_survey', fallStudentVoiceSurvey.id].join()}
        whenEl={whenText(fallStudentVoiceSurvey.form_timestamp)}
        badgeEl="What I want my teacher to know about me"
        educatorEl={null}
        substanceEl={<NoteText text={text} />}
      />
    );
  }

  renderHomeworkHelpSession(homeworkHelpSession) {
    const {educatorsIndex} = this.props;
    const text = 'Went to homework help for ' + homeworkHelpSession.courses.map(course => course.course_description).join(' and ') + '.';
    const educator = educatorsIndex[homeworkHelpSession.recorded_by_educator_id];
    return (
      <NoteShell
        key={['homework_help_session', homeworkHelpSession.id].join()}
        whenEl={whenText(homeworkHelpSession.form_timestamp)}
        badgeEl="Homework Help"
        educatorEl={<Educator educator={educator} />}
        substanceEl={<NoteText text={text} />}
      />
    );
  }

  renderBedfordEndOfYearTransition(importedForm) {
    const {educatorsIndex, student} = this.props;
    const educator = educatorsIndex[importedForm.educator_id];
    return (
      <NoteShell
        key={['bedford_end_of_year_transitions',importedForm.id].join()}
        whenEl={whenText(importedForm.form_timestamp)}
        badgeEl="Transition information"
        educatorEl={<Educator educator={educator} />}
        substanceEl={
          <BedfordTransitionSubstanceForProfile
            studentFirstName={student.first_name}
            importedForm={importedForm}
          />
        }
      />
    );
  }

  renderFlattenedForm(flattenedForm) {
    const text = `💬 From the "${flattenedForm.form_title}" student voice survey 💬\n\n${flattenedForm.text}`;
    return (
      <NoteShell
        key={['flattened_form', flattenedForm.id].join()}
        whenEl={whenText(flattenedForm.form_timestamp)}
        badgeEl={flattenedForm.form_title}
        educatorEl={null}
        substanceEl={<NoteText text={text} />}
      />
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
  student: PropTypes.shape({
    first_name: PropTypes.string.isRequired
  }).isRequired,
  currentEducator: PropTypes.object.isRequired,
  feed: InsightsPropTypes.feed.isRequired,
  requests: InsightsPropTypes.requests,
  educatorsIndex: PropTypes.object.isRequired,
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
  defaultSchoolYearsBack
};
NotesList.contextTypes = {
  nowFn: PropTypes.func.isRequired
};

const styles = {
  noItems: {
    margin: 10
  }
};

export const badgeStyle = styles.badge;

function whenText(railsDate) {
  return toMomentFromRailsDate(railsDate).format('MMMM D, YYYY');
}