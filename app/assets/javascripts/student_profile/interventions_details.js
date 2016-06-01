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
      paddingLeft: 0,
    },
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

    render: function() {
      return dom.div({ className: 'InterventionsDetails', style: styles.container },
        dom.div({ style: styles.notesContainer },
          dom.h4({ style: styles.title}, 'Notes'),
          this.renderTakeNotesSection(),
          createEl(NotesList, {
            feed: this.props.feed,
            educatorsIndex: this.props.educatorsIndex,
            eventNoteTypesIndex: this.props.eventNoteTypesIndex
          })
        ),
        dom.div({ style: styles.servicesContainer },
          dom.h4({ style: styles.title}, 'Services'),
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
      if (this.state.isTakingNotes || this.props.requests.saveNotes !== null) {
        return createEl(TakeNotes, {
          nowMoment: moment.utc(), // TODO(kr) thread through
          eventNoteTypesIndex: this.props.eventNoteTypesIndex,
          currentEducator: this.props.currentEducator,
          onSave: this.onClickSaveNotes,
          onCancel: this.onCancelNotes,
          requestState: this.props.requests.saveNotes
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
