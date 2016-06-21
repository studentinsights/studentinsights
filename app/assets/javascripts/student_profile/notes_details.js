(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var PropTypes = window.shared.PropTypes;
  var TakeNotes = window.shared.TakeNotes;
  var NotesList = window.shared.NotesList;
  var HelpBubble = window.shared.HelpBubble;

  var styles = {
    notesContainer: {
      flex: 1,
      marginRight: 20
    },
    restrictedNotesButton: {
      backgroundColor: '#E5370E',
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
  var NotesDetails = window.shared.NotesDetails = React.createClass({
    propTypes: {
      student: React.PropTypes.object.isRequired,
      eventNoteTypesIndex: React.PropTypes.object.isRequired,
      educatorsIndex: React.PropTypes.object.isRequired,
      eventNoteTypesIndex: React.PropTypes.object.isRequired,
      currentEducator: React.PropTypes.object.isRequired,
      actions: React.PropTypes.shape({
        onClickSaveNotes: React.PropTypes.func.isRequired
      }),
      feed: PropTypes.feed.isRequired,

      showingRestrictedNotes: React.PropTypes.bool.isRequired,
      title: React.PropTypes.string.isRequired,
      helpContent: React.PropTypes.string.isRequired,
      helpTitle: React.PropTypes.string.isRequired,
    },

    getInitialState: function() {
      return {
        isTakingNotes: false,
      }
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

    renderRestrictedNotesButtonIfAppropriate: function(){
      var self = this;

      if (this.props.currentEducator.can_view_restricted_notes && !this.props.showingRestrictedNotes){
        return dom.button({
          className: 'btn',
          style: styles.restrictedNotesButton,
          onClick: function(){
            location.href = '/students/' + self.props.student.id + '/restricted_notes';
          }
        }, 'Restricted Notes')
      } else {
        return null;
      }
    },

    render: function() {
      return dom.div({ className: 'NotesDetails', style: styles.notesContainer },
        dom.div({style: {borderBottom: '1px solid #333', padding: 10}},
          dom.h4({style: {display: 'inline', color: 'black'}}, this.props.title),
          createEl(HelpBubble, {
            title: this.props.helpTitle,
            teaserText: '(what is this?)',
            content: this.props.helpContent
          }),
          this.renderRestrictedNotesButtonIfAppropriate()
        ),
        this.renderTakeNotesSection(),
        createEl(NotesList, {
          feed: this.props.feed,
          educatorsIndex: this.props.educatorsIndex,
          eventNoteTypesIndex: this.props.eventNoteTypesIndex,
          onSaveNote: this.onClickSaveNotes
        })
      );
    },

    renderTakeNotesSection: function() {
      if (this.state.isTakingNotes || this.props.requests.saveNotes[undefined]) {
        return createEl(TakeNotes, {
          nowMoment: moment.utc(), // TODO(kr) thread through
          eventNoteTypesIndex: this.props.eventNoteTypesIndex,
          currentEducator: this.props.currentEducator,
          onSave: this.onClickSaveNotes,
          onCancel: this.onCancelNotes,
          requestState: this.props.requests.saveNotes[undefined] || ''
        });
      }

      return dom.div({},
        dom.button({
          className: 'btn take-notes',
          style: { marginTop: 10, display: 'inline' },
          onClick: this.onClickTakeNotes
        }, 'Take notes')
      );
    }
  });
})();
