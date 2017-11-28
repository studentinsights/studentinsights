import TakeNotes from './take_notes.jsx';
import PropTypes from '../helpers/PropTypes';

(function() {
  window.shared || (window.shared = {});
  const NotesList = window.shared.NotesList;
  const HelpBubble = window.shared.HelpBubble;

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
  window.shared.NotesDetails = React.createClass({
    propTypes: {
      student: React.PropTypes.object.isRequired,
      eventNoteTypesIndex: React.PropTypes.object.isRequired,
      educatorsIndex: React.PropTypes.object.isRequired,
      currentEducator: React.PropTypes.object.isRequired,
      actions: React.PropTypes.shape({
        onClickSaveNotes: React.PropTypes.func.isRequired,
        onEventNoteAttachmentDeleted: React.PropTypes.func,
        onDeleteEventNoteAttachment: React.PropTypes.func
      }),
      feed: PropTypes.feed.isRequired,
      requests: React.PropTypes.object.isRequired,

      showingRestrictedNotes: React.PropTypes.bool.isRequired,
      title: React.PropTypes.string.isRequired,
      helpContent: React.PropTypes.object.isRequired,
      helpTitle: React.PropTypes.string.isRequired,
    },

    getInitialState: function() {
      return {
        isTakingNotes: false,
      };
    },

    onClickTakeNotes: function(event) {
      this.setState({ isTakingNotes: true });
    },

    onCancelNotes: function(event) {
      this.setState({ isTakingNotes: false });
    },

    onClickSaveNotes: function(eventNoteParams, event) {
      this.props.actions.onClickSaveNotes(eventNoteParams);
      this.setState({ isTakingNotes: false });
    },

    render: function() {
      const { student, title } = this.props;

      return (
        <div className="NotesDetails" style={styles.notesContainer}>
          <div style={{borderBottom: '1px solid #333', padding: 10}}>
            <h4 style={{display: 'inline', color: 'black'}}>
              {title} for {student.first_name} {student.last_name}
            </h4>
            <HelpBubble
              title={this.props.helpTitle}
              teaserText="(what is this?)"
              content={this.props.helpContent} />
            {this.renderRestrictedNotesButtonIfAppropriate()}
          </div>
          {this.renderTakeNotesSection()}
          <NotesList
            feed={this.props.feed}
            educatorsIndex={this.props.educatorsIndex}
            eventNoteTypesIndex={this.props.eventNoteTypesIndex}
            onSaveNote={this.onClickSaveNotes}
            onEventNoteAttachmentDeleted={this.props.actions.onDeleteEventNoteAttachment} />
        </div>
      );
    },

    renderTakeNotesSection: function() {
      if (this.state.isTakingNotes || this.props.requests.saveNote !== null) {
        return (
          <TakeNotes
            // TODO(kr) thread through
            nowMoment={moment.utc()}
            eventNoteTypesIndex={this.props.eventNoteTypesIndex}
            currentEducator={this.props.currentEducator}
            onSave={this.onClickSaveNotes}
            onCancel={this.onCancelNotes}
            requestState={this.props.requests.saveNote} />
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
    },

    renderRestrictedNotesButtonIfAppropriate() {
      if (this.props.currentEducator.can_view_restricted_notes && !this.props.showingRestrictedNotes){
        return (
          <a
            className="btn btn-warning"
            style={styles.restrictedNotesButton}
            href={'/students/' + this.props.student.id + '/restricted_notes'}>
            {'Restricted Notes (' + this.props.student.restricted_notes_count + ')'}
          </a>
        );
      } else {
        return null;
      }
    }
  });
})();
