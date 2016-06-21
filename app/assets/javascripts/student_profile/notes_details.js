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
      actions: PropTypes.actions.isRequired,
      feed: PropTypes.feed.isRequired
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

    getNotesHelpContent: function(){
      return '\
        <p>The Notes tab is the place to keep notes about a student, whether it’s SST, MTSS, \
        a parent conversation, or some informal strategies that a teacher/team is using to help a student. \
        More formal strategies (e.g. the student meets with a tutor or counselor every week) should be recorded in Services.</p> \
        <br> \
        <p><b>Who can enter a note?</b> \
        Anyone who works with or involved with the student, \
        including classroom/ELL/SPED teachers, principals/assistant principals, counselors, and attendance officers.</p> \
        <br> \
        <p><b>What can/should I put in a note?</b> \
        <br> \
        The true test is to think about whether the information will help your \
        team down the road in supporting this student, either in the coming weeks, or a few years from now. Examples include:</p> \
        <br> \
        <ul> \
          <li>"Oscar just showed a 20 point increase in ORF. \
          It seems like the take home readings are working (parents are very supportive) and we will continue it."</li> \
          <li>"This is a follow-up MTSS meeting for Julie. Over the last 4 weeks, \
          she is not showing many gains despite the volunteer tutor and the change in seating…."</li> \
          <li>"Alex just got an M on the latest F&P. Will try having him go next door to \
          join the other 4th grade group during guided reading."</li> \
          <li>"Just found that Cora really likes to go help out in grade 1. \
          Best incentive yet for when she stays on task and completes work."</li> \
          <li>"Arranged for Kevin to go to community schools 2x/week and to get extra homework help."</li> \
          <li>"Julia will do an FBA and report back at the next SST meeting to determine sources of the behavior."</li> \
          <li>"Mediation occurred between Oscar and Uri and went well. Both have agreed to keep distance for 2 weeks."</li> \
          <li>"Parent called to report that Jill won art award and will be going to nationals. \
          She suggested this might be an outlet if she shows frustration in schoolwork."</li> \
        </ul> \
        <br> \
        <p><b>What is a Restricted Note?</b> \
        <br> \
        Restricted Notes are only visible to the Principal, AP, and guidance counselors. \
        If a note contains sensitive information about healthcare, courts, or child abuse, think about using a Restricted Note.\
        <br> \
        <br> \
        <ul> \
          <li>"51a filed on 3/21. Waiting determination and follow-up from DCF."</li> \
          <li>"Medicine change for Uri on 4/10. So far slight increase in focus."</li> \
        </ul> \
        <br> \
        This feature is currently in development. \
        '
    },

    renderRestrictedNotesButtonIfAppropriate: function(){
      var self = this;

      if (this.props.currentEducator.can_view_restricted_notes){
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
      return dom.div({ className: 'NotesDetails', style: styles.container },
        dom.div({ style: styles.notesContainer },
          dom.div({style: {borderBottom: '1px solid #333', padding: 10}},
            dom.h4({style: {display: 'inline', color: 'black'}}, 'Notes'),
            createEl(HelpBubble, {
              title: 'What is a Note?',
              teaserText: '(what is this?)',
              content: this.getNotesHelpContent()
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
        )
      );
    },

    renderTakeNotesSection: function() {
      if (
        this.state.isTakingNotes
        || this.props.requests.saveNotes[undefined]
      ) {
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
          style: { marginTop: 10 },
          onClick: this.onClickTakeNotes
        }, 'Take notes')
      );
    }
  });
})();
