(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var Educator = window.shared.Educator;
  var PropTypes = window.shared.PropTypes;
  var TakeNotes = window.shared.TakeNotes;
  var NotesList = window.shared.NotesList;
  var ServicesList = window.shared.ServicesList;
  var RecordService = window.shared.RecordService;
  var HelpBubble = window.shared.HelpBubble;

  var styles = {
    container: {
      display: 'flex'
    },
    notesContainer: {
      flex: 1,
      marginRight: 20
    },
    servicesContainer: {
      flex: 1
    },
    addServiceContainer: {
      marginTop: 10
    },
    title: {
      borderBottom: '1px solid #333',
      color: 'black',
      padding: 10,
      paddingLeft: 0
    }
  };



  /*
  The bottom region of the page, showing notes about the student, services
  they are receiving, and allowing users to enter new information about
  these as well.
  */
  var InterventionsDetails = window.shared.InterventionsDetails = React.createClass({
    propTypes: {
      interventionTypesIndex: React.PropTypes.object.isRequired,
      serviceTypesIndex: React.PropTypes.object.isRequired,
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
        isAddingService: false
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

    onClickRecordService: function(event) {
      this.setState({ isAddingService: true });
    },

    onCancelRecordService: function(event) {
      this.setState({ isAddingService: false });
    },

    onClickSaveService: function(serviceParams, event) {
      this.props.actions.onClickSaveService(serviceParams);
      this.setState({ isAddingService: false });
    },

    onClickDiscontinueService: function(serviceId, event) {
      this.props.actions.onClickDiscontinueService(serviceId);
    },

    getNotesHelpContent: function(){
      return '\
        <p>The Notes tab is the place to keep notes about a student, whether it’s SST, MTSS, \
        a parent conversation, or some informal strategies that a teacher/team is using to help a student. \
        More formal strategies (e.g. the student meets with a tutor or counselor every week) should be recorded in Services.</p> \
        <br> \
        <p><b>Who can enter a note?</b> Anyone who works with or involved with the student, \
        including classroom/ELL/SPED teachers, principals/assistant principals, counselors, and attendance officers.</p> \
        <br> \
        <p><b>What can/should I put in a note?</b> The true test is to think about whether the information will help your \
        team down the road in supporting this student, either in the coming weeks, or a few years from now. Examples include:</p> \
        <br> \
        <ul> \
          <li>"Oscar just showed a 20 point increase in ORF. \
          It seems like the take home readings are working (parents are very supportive) and we will continue it."</li> \
          <li>"This is a follow-up MTSS meeting for Julie. Over the last 4 weeks, \
          she is not showing many gains despite the volunteer tutor and the change in seating…."</li> \
          <li>"Alex just got an M on the latest F&P. Will try having him go next door to \
          join the other 4th grade group during guided reading."</li> \
          <li>"Medicine change for Uri on 4/10. So far slight increase in focus."</li> \
          <li>"51a filed on 3/21. Waiting determination and follow-up from DCF."</li> \
          <li>"Just found that Cora really likes to go help out in grade 1. \
          Best incentive yet for when she stays on task and completes work."</li> \
          <li>"Arranged for Kevin to go to community schools 2x/week and to get extra homework help."</li> \
          <li>"Julia will do an FBA and report back at the next SST meeting to determine sources of the behavior."</li> \
          <li>"Mediation occurred between Oscar and Uri and went well. Both have agreed to keep distance for 2 weeks."</li> \
          <li>"Parent called to report that Jill won art award and will be going to nationals. \
          She suggested this might be an outlet if she shows frustration in schoolwork."</li> \
        </ul>'
    },

    getServicesHelpContent: function(){
      return "\
        <p>While Notes are a catch-all for student information, Services are a place to keep track of more formal \
        extensive interventions for a student. It includes a specific person responsible and dates.</p> \
        <br> \
        <p>The types of Services are:</p> \
        <ul> \
          <li><b>Attendance Officer:</b> This usually includes home visit(s), regular follow-up, \
          and could later on lead to a formal attendance contract.</li> \
          <li><b>Attendance Contract:</b> This is usually done in cooperation with the attendance officer, \
          school adjustment counselor, and/or principal. This is a more formal document that requires a parent and \
          student signature, along with regular checkpoints.</li> \
          <li><b>Behavior Contract:</b> This is usually done in cooperation with the attendance officer, \
          school adjustment counselor, and/or principal. This is a more formal document that requires a parent and \
          student signature, along with regular checkpoints.</li> \
          <li><b>Counseling, in-house:</b> Student receives regular weekly or bi-weekly counseling from an SPS counselor. \
          One time or infrequent check-ins by a counselor should just be recorded in Notes.</li> \
          <li><b>Counseling, outside:</b> Student receives regular weekly or bi-weekly counseling from an outside \
          counselor, ex. Riverside, Home for Little Wanderers. One time or infrequent check-ins by a counselor should \
          just be recorded in Notes.</li> \
          <li><b>Reading Intervention:</b> Student works with a reading specialist at least 4x/week for 30-40 minutes.</li> \
        </ul> \
        <br> \
        <p>If your data fits into one of these categories, it's a Service. Otherwise, it's a Note.</p>"
    },

    render: function() {
      return dom.div({ className: 'InterventionsDetails', style: styles.container },
        dom.div({ style: styles.notesContainer },
          dom.div({style: {borderBottom: '1px solid #333', padding: 10}},
            dom.h4({style: {display: 'inline', color: 'black'}}, 'Notes'),
            createEl(HelpBubble, {
              title: 'What is a Note?',
              teaserText: '(what is this?)',
              content: this.getNotesHelpContent()
            })
          ),
          this.renderTakeNotesSection(),
          createEl(NotesList, {
            feed: this.props.feed,
            educatorsIndex: this.props.educatorsIndex,
            eventNoteTypesIndex: this.props.eventNoteTypesIndex,
            onSaveNote: this.onClickSaveNotes
          })
        ),
        dom.div({ style: styles.servicesContainer },
          dom.div({style: {borderBottom: '1px solid #333', padding: 10}},
            dom.h4({style: {display: 'inline', color: 'black'}}, 'Services'),
            createEl(HelpBubble, {
              title: 'What is a Service?',
              teaserText: '(what is this?)',
              content: this.getServicesHelpContent()
            })
          ),
          dom.div({ style: styles.addServiceContainer }, this.renderRecordServiceSection()),
          createEl(ServicesList, {
            servicesFeed: this.props.feed.services,
            educatorsIndex: this.props.educatorsIndex,
            serviceTypesIndex: this.props.serviceTypesIndex,
            onClickDiscontinueService: this.onClickDiscontinueService,
            discontinueServiceRequests: this.props.requests.discontinueService
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
    },

    renderRecordServiceSection: function() {
      if (this.state.isAddingService || this.props.requests.saveService !== null) {
        return createEl(RecordService, {
          studentFirstName: this.props.student.first_name,
          studentId: this.props.student.id,
          onSave: this.onClickSaveService,
          onCancel: this.onCancelRecordService,
          requestState: this.props.requests.saveService,

          nowMoment: moment.utc(), // TODO(kr) thread through
          currentEducator: this.props.currentEducator,
          serviceTypesIndex: this.props.serviceTypesIndex,
          educatorsIndex: this.props.educatorsIndex,
        });
      }

      return dom.button({
        className: 'btn record-service',
        onClick: this.onClickRecordService
      }, 'Record service')
    }
  });
})();
