(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;
  
  var Educator = window.shared.Educator;
  var TakeNotes = window.shared.TakeNotes;
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
    dialog: {
      border: '1px solid #ccc',
      borderRadius: 2,
      padding: 20,
      marginBottom: 20,
      marginTop: 10
    },
    addServiceContainer: {
      marginTop: 10
    },
    interventionsContainer: {
      flex: 1
    },
    noItems: {
      margin: 10
    },
    inlineBlock: {
      display: 'inline-block'
    },
    userText: {
      whiteSpace: 'pre-wrap'
    },
    daysAgo: {
      opacity: 0.25,
      paddingLeft: 10,
      display: 'inline-block'
    },
    title: {
      borderBottom: '1px solid #333',
      // fontWeight: 'bold',
      color: 'black',
      padding: 10,
      paddingLeft: 0
    },
    date: {
      paddingRight: 10,
      fontWeight: 'bold',
      display: 'inline-block'
    },
    badge: {
      display: 'inline-block',
      background: '#eee',
      outline: '3px solid #eee',
      width: '10em',
      textAlign: 'center',
      marginLeft: 10,
      marginRight: 10
    },
    educator: {
      paddingLeft: 5,
      display: 'inline-block'
    },
    note: {
      border: '1px solid #eee',
      padding: 15,
      marginTop: 10,
      marginBottom: 10
    },
    service: {
      border: '1px solid #eee',
      padding: 15,
      marginTop: 10,
      marginBottom: 10
    },
    cancelTakeNotesButton: { // overidding CSS
      color: 'black',
      background: '#eee',
      marginLeft: 10
    },
    noteText: {
      marginTop: 5
    },
    discontinue: {
      background: 'white',
      opacity: 0.5,
      border: '1px solid #ccc',
      color: '#666'
    }
  };


  // TODO(kr) extract, simplify styles
  //props: {key, noteMoment, badge, educator_id, content}
  var NoteHeader = React.createClass({
    render: function() {
      var header = this.props; // TODO(kr)
      return dom.div({
        className: 'note',
        style: styles.note
      },
        dom.div({}, 
          dom.span({ style: styles.date }, header.noteMoment.format('MMMM D, YYYY')),
          header.badge,
          dom.span({ style: styles.educator }, createEl(Educator, {
            educator: this.props.educatorsIndex[header.educatorId]
          }))
        ),
        dom.div({ style: { whiteSpace: 'pre-wrap' } },
          dom.div({ style: styles.noteText }, header.content)
        )
      );
    }
  });

  var InterventionsDetails = window.shared.InterventionsDetails = React.createClass({
    propTypes: {
      interventionTypesIndex: React.PropTypes.object.isRequired,
      serviceTypesIndex: React.PropTypes.object.isRequired,
      educatorsIndex: React.PropTypes.object.isRequired,
      currentEducator: React.PropTypes.object.isRequired,

      mergedNotes: React.PropTypes.array.isRequired,
      actions: PropTypes.actions.isRequired
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
          this.renderNotes()
        ),
        dom.div({ style: styles.interventionsContainer },
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

    renderNotes: function() {
      var mergedNotes = this.props.mergedNotes;
      return dom.div({}, (mergedNotes.length === 0) ? dom.div({ style: styles.noItems }, 'No notes') : mergedNotes.map(function(mergedNote) {
        switch (mergedNote.type) {
          case 'event_notes': return this.renderEventNote(mergedNote);
          case 'deprecated_notes': return this.renderDeprecatedNote(mergedNote);
          case 'deprecated_interventions': return this.renderDeprecatedIntervention(mergedNote);
          case 'deprecated_progress_notes': return this.renderDeprecatedProgressNote(mergedNote);
        }
      }, this));
    },

    renderEventNoteTypeBadge: function(eventNoteTypeId) {
      switch (eventNoteTypeId) {
        case 1: return dom.span({ style: styles.badge }, 'SST meeting');
        case 2: return dom.span({ style: styles.badge }, 'MTSS meeting');
        case 3: return dom.span({ style: styles.badge }, 'Family');
        case 5: return dom.span({ style: styles.badge }, 'Something else');
      }

      return null;
    },

    renderEventNote: function(eventNote) {
      return createEl(NoteHeader, {
        key: ['event_note', eventNote.id].join(),
        noteMoment: moment.utc(eventNote.recorded_at),
        badge: this.renderEventNoteTypeBadge(eventNote.event_note_type_id),
        educatorId: eventNote.educator_id,
        content: eventNote.text,
        educatorsIndex: this.props.educatorsIndex
      });
    },

    renderDeprecatedNote: function(deprecatedNote) {
      return createEl(NoteHeader, {
        key: ['deprecated_note', deprecatedNote.id].join(),
        noteMoment: moment.utc(deprecatedNote.created_at_timestamp),
        badge: dom.span({ style: styles.badge }, 'Older note'),
        educatorId: deprecatedNote.educator_id,
        content: deprecatedNote.content,
        educatorsIndex: this.props.educatorsIndex
      });
    },

    // TODO(kr) support custom intervention type
    // This assumes that the `end_date` field is not accurate enough to be worth splitting
    // this out into two note entries.
    renderDeprecatedIntervention: function(deprecatedIntervention) {
      return createEl(NoteHeader, {
        key: ['deprecated_intervention', deprecatedIntervention.id].join(),
        noteMoment: moment.utc(deprecatedIntervention.start_date_timestamp),
        badge: dom.span({ style: styles.badge }, 'Older intervention'),
        educatorId: deprecatedIntervention.educator_id,
        content: _.compact([deprecatedIntervention.name, deprecatedIntervention.comment, deprecatedIntervention.goal]).join('\n'),
        educatorsIndex: this.props.educatorsIndex
      });
    },

    // TODO(kr) not done!
    renderDeprecatedProgressNote: function(deprecatedProgressNote) {
      return null;
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