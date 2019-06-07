import React from 'react';
import PropTypes from 'prop-types';
import * as InsightsPropTypes from '../helpers/InsightsPropTypes';
import SectionHeading from '../components/SectionHeading';
import LightHelpBubble from './LightHelpBubble';
import NotesList from './NotesList';
import DraftNote from './DraftNote';
import SecondTransitionNoteDialog, {enableTransitionNoteDialog} from './SecondTransitionNoteDialog';


/*
The bottom region of the page, showing notes about the student, services
they are receiving, and allowing users to enter new information about
these as well.
*/
export default class LightNotesDetails extends React.Component {

  constructor(props){
    super(props);

    this.onClickSecondTransitionNoteLink = this.onClickSecondTransitionNoteLink.bind(this);
    this.onClickTakeNotes = this.onClickTakeNotes.bind(this);
    this.onCreateNewNote = this.onCreateNewNote.bind(this);
    this.onCancelNotes = this.onCancelNotes.bind(this);
    this.onUpdateExistingNote = this.onUpdateExistingNote.bind(this);
  }

  isTakingNotes() {
    return (
      this.props.isTakingNotes ||
      this.props.requests.createNote !== null
    );
  }

  onClickSecondTransitionNoteLink(event) {
    event.preventDefault();
    this.props.onWritingTransitionNoteChanged(true);
  }

  onClickTakeNotes(event) {
    this.props.onTakingNotesChanged(true);
  }

  onCancelNotes(event) {
    this.props.onTakingNotesChanged(false);
  }

  onCreateNewNote(eventNoteParams, event) {
    this.props.actions.onCreateNewNote(eventNoteParams);
    this.props.onTakingNotesChanged(false);
  }

  onUpdateExistingNote(eventNoteParams) {
    this.props.actions.onUpdateExistingNote(eventNoteParams);
    this.props.onTakingNotesChanged(false);
  }

  render() {
    const {
      student,
      title,
      currentEducator,
      requests,
      feed,
      actions,
      educatorsIndex
    } = this.props;

    return (
      <div className="LightNotesDetails" style={styles.notesContainer}>
        {this.renderSecondTransitionNoteDialog()}
        {<SectionHeading titleStyle={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', padding: 2}}>
            <span>{title} for {student.first_name}</span>
            <LightHelpBubble
              title={this.props.helpTitle}
              content={this.props.helpContent} />
          </div>
          {!this.isTakingNotes() && this.renderTakeNotesButton()}
        </SectionHeading>}
        <div>
          {this.isTakingNotes() && this.renderTakeNotesDialog()}
          <NotesList
            student={student}
            currentEducator={currentEducator}
            feed={feed}
            requests={requests}
            canUserAccessRestrictedNotes={currentEducator.can_view_restricted_notes}
            educatorsIndex={educatorsIndex}
            onSaveNote={this.onUpdateExistingNote}
            onEventNoteAttachmentDeleted={actions.onDeleteEventNoteAttachment} />
        </div>
      </div>
    );
  }

  renderSecondTransitionNoteDialog() {
    const {
      actions,
      student,
      currentEducator,
      isWritingTransitionNote,
      onWritingTransitionNoteChanged
    } = this.props;

    if (!isWritingTransitionNote) return null;
    return (
      <SecondTransitionNoteDialog
        student={student}
        educatorId={currentEducator.id}
        onSavedJson={json => actions.onSecondTransitionNoteAdded(json)}
        onClose={() => onWritingTransitionNoteChanged(false)}
      />
    );
  }

  renderTakeNotesButton() {
    const {currentEducator, student} = this.props;

    const showSecondTransitionNoteLink = enableTransitionNoteDialog(currentEducator, student);
    return (
      <div>
        {showSecondTransitionNoteLink && (
          <a
            href="#"
            style={{marginRight: 10}}
            onClick={this.onClickSecondTransitionNoteLink}>
            <span><span style={{fontWeight: 'bold', paddingRight: 5}}>+</span><span>transition</span></span>
          </a>
        )}
        <button
          className="btn take-notes"
          style={{display: 'inline-block', margin: 0}}
          onClick={this.onClickTakeNotes}>
          <span><span style={{fontWeight: 'bold', paddingRight: 5}}>+</span><span>note</span></span>
        </button>
      </div>
    );
  }

  renderTakeNotesDialog() {
    const {
      currentEducator,
      student,
      requests
    } = this.props;

    return (
      <DraftNote
        student={student}
        currentEducator={currentEducator}
        onSave={this.onCreateNewNote}
        onCancel={this.onCancelNotes}
        requestState={requests.createNote}
        showRestrictedCheckbox={currentEducator.can_view_restricted_notes}
      />
    );
  }
}

LightNotesDetails.propTypes = {
  student: PropTypes.object.isRequired,
  educatorsIndex: PropTypes.object.isRequired,
  currentEducator: PropTypes.shape({
    can_view_restricted_notes: PropTypes.bool.isRequired,
    labels: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  actions: PropTypes.shape({
    onCreateNewNote: PropTypes.func.isRequired,
    onUpdateExistingNote: PropTypes.func.isRequired,
    onDeleteEventNoteAttachment: PropTypes.func,
  }),
  feed: InsightsPropTypes.feed.isRequired,
  requests: PropTypes.object.isRequired,

  title: PropTypes.string.isRequired,
  helpContent: PropTypes.node.isRequired,
  helpTitle: PropTypes.string.isRequired,
  isTakingNotes: PropTypes.bool.isRequired,
  onTakingNotesChanged: PropTypes.func.isRequired,
  isWritingTransitionNote: PropTypes.bool.isRequired,
  onWritingTransitionNoteChanged: PropTypes.func.isRequired
};


const styles = {
  notesContainer: {
    width: '50%',
    marginRight: 20
  }
};
