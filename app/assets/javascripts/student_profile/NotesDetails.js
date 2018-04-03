import TakeNotes from './take_notes.jsx';
import PropTypes from '../helpers/prop_types.jsx';
import React from 'react';
import HelpBubble from '../components/HelpBubble';
import SectionHeading from '../components/SectionHeading';

const styles = {
  notesContainer: {
    flex: 1,
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
    const { student, title } = this.props;
    const NotesList = window.shared.NotesList;

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
          feed={this.props.feed}
          educatorsIndex={this.props.educatorsIndex}
          eventNoteTypesIndex={this.props.eventNoteTypesIndex}
          onSaveNote={this.onClickSaveNotes}
          onEventNoteAttachmentDeleted={this.props.actions.onDeleteEventNoteAttachment} />
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
          eventNoteTypesIndex={this.props.eventNoteTypesIndex}
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
    if (this.props.currentEducator.can_view_restricted_notes && !this.props.showingRestrictedNotes){
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
  student: React.PropTypes.object.isRequired,
  eventNoteTypesIndex: React.PropTypes.object.isRequired,
  educatorsIndex: React.PropTypes.object.isRequired,
  currentEducator: React.PropTypes.object.isRequired,
  actions: React.PropTypes.shape({
    onClickSaveNotes: React.PropTypes.func.isRequired,
    onEventNoteAttachmentDeleted: React.PropTypes.func,
    onDeleteEventNoteAttachment: React.PropTypes.func,
    onChangeNoteInProgressText: React.PropTypes.func.isRequired,
    onClickNoteType: React.PropTypes.func.isRequired,
    onChangeAttachmentUrl: React.PropTypes.func.isRequired,
  }),
  feed: PropTypes.feed.isRequired,
  requests: React.PropTypes.object.isRequired,

  noteInProgressText: React.PropTypes.string.isRequired,
  noteInProgressType: React.PropTypes.number,
  noteInProgressAttachmentUrls: React.PropTypes.arrayOf(
    React.PropTypes.string
  ).isRequired,

  showingRestrictedNotes: React.PropTypes.bool.isRequired,
  title: React.PropTypes.string.isRequired,
  helpContent: React.PropTypes.object.isRequired,
  helpTitle: React.PropTypes.string.isRequired,
};

export default NotesDetails;
