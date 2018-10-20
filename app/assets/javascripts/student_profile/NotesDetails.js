import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import * as InsightsPropTypes from '../helpers/InsightsPropTypes';
import HelpBubble from '../components/HelpBubble';
import SectionHeading from '../components/SectionHeading';
import NotesList from './NotesList';
import TakeNotes from './TakeNotes';


const styles = {
  notesContainer: {
    width: '50%',
    marginRight: 20
  },
  restrictedNotesButton: {
    color: 'white',
    fontSize: 12,
    padding: 8,
    float: 'right'
  }
};

/*
The bottom region of the page, showing notes about the student, services
they are receiving, and allowing users to enter new information about
these as well.
*/
class NotesDetails extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      isTakingNotes: false
    };

    this.onClickTakeNotes = this.onClickTakeNotes.bind(this);
    this.onClickSaveNotes = this.onClickSaveNotes.bind(this);
    this.onCancelNotes = this.onCancelNotes.bind(this);
  }

  onClickTakeNotes(event) {
    this.setState({ isTakingNotes: true });
  }

  onCancelNotes(event) {
    this.setState({ isTakingNotes: false });
  }

  onClickSaveNotes(eventNoteParams, event) {
    this.props.actions.onClickSaveNotes(eventNoteParams);
    this.setState({ isTakingNotes: false });
  }

  render() {
    const {
      currentEducator,
      student,
      title,
      feed,
      educatorsIndex,
      actions,
      showRestrictedNoteContent,
      allowDirectEditingOfRestrictedNoteText
    } = this.props;

    return (
      <div className="NotesDetails" style={styles.notesContainer}>
        <SectionHeading>
          <span>{title} for {student.first_name}</span>
          <HelpBubble
            teaser="(what is this?)"
            title={this.props.helpTitle}
            content={this.props.helpContent} />
          {this.renderRestrictedNotesButtonIfAppropriate()}
        </SectionHeading>
        {this.renderTakeNotesSection()}
        <NotesList
          currentEducatorId={currentEducator.id}
          feed={feed}
          educatorsIndex={educatorsIndex}
          showRestrictedNoteContent={showRestrictedNoteContent}
          allowDirectEditingOfRestrictedNoteText={allowDirectEditingOfRestrictedNoteText}
          onSaveNote={this.onClickSaveNotes}
          onEventNoteAttachmentDeleted={actions.onDeleteEventNoteAttachment} />
      </div>
    );
  }

  renderTakeNotesSection() {
    const showTakeNotes = this.state.isTakingNotes ||
                          this.props.requests.saveNote !== null ||
                          this.props.noteInProgressText.length > 0 ||
                          this.props.noteInProgressAttachmentUrls.length > 0;

    if (showTakeNotes) {
      return (
        <TakeNotes
          // TODO(kr) thread through
          nowMoment={moment.utc()}
          currentEducator={this.props.currentEducator}
          onSave={this.onClickSaveNotes}
          onCancel={this.onCancelNotes}
          requestState={this.props.requests.saveNote}
          noteInProgressText={this.props.noteInProgressText}
          noteInProgressType={this.props.noteInProgressType}
          noteInProgressAttachmentUrls={this.props.noteInProgressAttachmentUrls}
          onClickNoteType={this.props.actions.onClickNoteType}
          onChangeNoteInProgressText={this.props.actions.onChangeNoteInProgressText}
          onChangeAttachmentUrl={this.props.actions.onChangeAttachmentUrl} />
      );
    }

    return (
      <div>
        <button
          className="btn take-notes"
          style={{ marginTop: 10, display: 'inline' }}
          onClick={this.onClickTakeNotes}>
          Take notes
        </button>
      </div>
    );
  }

  renderRestrictedNotesButtonIfAppropriate() {
    const {currentEducator, showRestrictedNotesButton} = this.props;
    if (currentEducator.can_view_restricted_notes && showRestrictedNotesButton) {
      return (
        <a
          className="btn btn-warning"
          style={styles.restrictedNotesButton}
          href={'/students/' + this.props.student.id + '/restricted_notes'}>
          {'Restricted (' + this.props.student.restricted_notes_count + ')'}
        </a>
      );
    } else {
      return null;
    }
  }
}

NotesDetails.propTypes = {
  student: PropTypes.object.isRequired,
  educatorsIndex: PropTypes.object.isRequired,
  currentEducator: PropTypes.object.isRequired,
  actions: PropTypes.shape({
    onClickSaveNotes: PropTypes.func.isRequired,
    onEventNoteAttachmentDeleted: PropTypes.func,
    onDeleteEventNoteAttachment: PropTypes.func,
    onChangeNoteInProgressText: PropTypes.func.isRequired,
    onClickNoteType: PropTypes.func.isRequired,
    onChangeAttachmentUrl: PropTypes.func.isRequired,
  }),
  feed: InsightsPropTypes.feed.isRequired,
  requests: PropTypes.object.isRequired,

  noteInProgressText: PropTypes.string.isRequired,
  noteInProgressType: PropTypes.number,
  noteInProgressAttachmentUrls: PropTypes.arrayOf(
    PropTypes.string
  ).isRequired,

  allowDirectEditingOfRestrictedNoteText: PropTypes.bool,
  showRestrictedNoteContent: PropTypes.bool,
  showRestrictedNotesButton: PropTypes.bool,
  title: PropTypes.string.isRequired,
  helpContent: PropTypes.node.isRequired,
  helpTitle: PropTypes.string.isRequired,
};

export default NotesDetails;
