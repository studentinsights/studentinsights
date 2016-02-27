(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var Educator = window.shared.Educator;
  var TakeNotes = window.shared.TakeNotes;
  var NotesList = window.shared.NotesList;
  var RecordService = window.shared.RecordService;
  var PropTypes = window.shared.PropTypes;
  var serviceColor = window.shared.serviceColor;

  // TODO(kr) need to clean these all out
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
      // fontWeight: 'bold',
      color: 'black',
      padding: 10,
      paddingLeft: 0
    },

    service: {
      border: '1px solid #eee',
      padding: 15,
      marginTop: 10,
      marginBottom: 10
    },
    userText: {
      whiteSpace: 'pre-wrap'
    },
    daysAgo: {
      opacity: 0.25,
      paddingLeft: 10,
      display: 'inline-block'
    },
    discontinue: {
      background: 'white',
      opacity: 0.5,
      border: '1px solid #ccc',
      color: '#666'
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
      educatorsIndex: React.PropTypes.object.isRequired,
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

    onSaveNotes: function(eventNoteParams, event) {
      this.props.actions.onClickSaveNotes(eventNoteParams);
      this.setState({ isTakingNotes: false });
    },

    onClickRecordService: function(event) {
      this.setState({ isAddingService: true });
    },

    onCancelRecordService: function(event) {
      this.setState({ isAddingService: false });
    },

    onSaveRecordService: function(serviceParams, event) {
      // TODO(kr) not done yet
    },

    render: function() {
      return dom.div({ className: 'InterventionsDetails', style: styles.container },
        dom.div({ style: styles.notesContainer },
          dom.h4({ style: styles.title}, 'Notes'),
          this.renderTakeNotesSection(),
          createEl(NotesList, {
            feed: this.props.feed,
            educatorsIndex: this.props.educatorsIndex
          })
        ),
        dom.div({ style: styles.servicesContainer },
          dom.h4({ style: styles.title}, 'Services'),
          dom.div({ style: styles.addServiceContainer }, this.renderRecordServiceSection()),
          (this.props.feed.services.length === 0)
            ? dom.div({ style: styles.noItems }, 'No services')
            : this.renderServices()
        )
      );
    },

    renderTakeNotesSection: function() {
      if (this.state.isTakingNotes || this.props.requests.saveNotes !== null) {
        return createEl(TakeNotes, {
          nowMoment: moment.utc(), // TODO(kr) thread through
          currentEducator: this.props.currentEducator,
          onSave: this.onSaveNotes,
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
      // TODO(kr) handle saving state
      if (this.state.isAddingService) {
        return createEl(RecordService, {
          studentFirstName: this.props.student.first_name,
          onSave: this.onSaveNotes,
          onCancel: this.onCancelNotes,
          requestState: this.props.requests.saveNotes,

          nowMoment: moment.utc(), // TODO(kr) thread through
          currentEducator: this.props.currentEducator,
          serviceTypesIndex: this.props.serviceTypesIndex,
          educatorsIndex: this.props.educatorsIndex
        });
      }

      return dom.button({
        className: 'btn record-service',
        onClick: this.onClickRecordService
      }, 'Record service')
    },

    renderServices: function() {
      var sortedInterventions = _.sortBy(this.props.feed.services, 'date_started').reverse();
      return sortedInterventions.map(this.renderService);
    },

    // TODO(kr) allow editing, fixup.  'no longer active'
    // TODO(kr) for now, going with ignoring older data we could interpret to be here,
    // for end-user simplicity.  Start with fresh data.
    renderService: function(service) {
      var serviceText = this.props.serviceTypesIndex[service.service_type_id].name;
      var momentStarted = moment.utc(service.date_started);
      var educatorEmail = this.props.educatorsIndex[service.assigned_to_educator_id].email;
      return dom.div({
        key: service.id,
        style: merge(styles.service, { background: serviceColor(service.service_type_id) })
      },
        dom.div({ style: { display: 'flex' } },
          dom.div({ style: { flex: 1 } },
            dom.div({ style: { fontWeight: 'bold' } }, serviceText),
            dom.div({}, 'With ' + educatorEmail),
            dom.div({},
              'Since ',
              momentStarted.format('MMMM D, YYYY'),
              dom.span({ style: styles.daysAgo }, momentStarted.fromNow(true))
            )
          )
          // TODO(kr) re-enable
          // dom.div({},
          //   dom.button({ className: 'btn', style: styles.discontinue }, 'Discontinue')
          // )
        ),
        dom.div({ style: merge(styles.userText, { paddingTop: 15 }) }, service.comment)
      );
    }
  });
})();