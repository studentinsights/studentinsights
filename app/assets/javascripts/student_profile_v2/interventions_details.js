(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;
  
  var Educator = window.shared.Educator;
  var TakeNotes = window.shared.TakeNotes;
  var RecordService = window.shared.RecordService;
  var PropTypes = window.shared.PropTypes;

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
      width: '8em',
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
    intervention: {
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
    expandedNote: {
      marginTop: 5
    },
    collapsedNote: {
      maxHeight: '2em',
      overflowY: 'hidden'
    },
    discontinue: {
      background: 'white',
      opacity: 0.5,
      border: '1px solid #ccc',
      color: '#666'
    }
  };


  var InterventionsDetails = window.shared.InterventionsDetails = React.createClass({
    propTypes: {
      // TODO(kr) collapse into statics
      interventionTypesIndex: React.PropTypes.object.isRequired,
      serviceTypesIndex: React.PropTypes.object.isRequired,
      educatorsIndex: React.PropTypes.object.isRequired,
      currentEducator: React.PropTypes.object.isRequired,

      mergedNotes: React.PropTypes.array.isRequired,
      actions: PropTypes.actions.isRequired
    },

    getInitialState: function() {
      return {
        expandedNoteIds: [],

        isTakingNotes: false,

        isAddingService: false,
        serviceProvidedByEducatorId: null,
        serviceTypeId: null
      }
    },

    isExpanded: function(note) {
      return (this.state.expandedNoteIds.indexOf(note.id) !== -1);
    },

    onNoteClicked: function(note) {
      var updatedNoteIds = (this.isExpanded(note))
        ? _.without(this.state.expandedNoteIds, note.id)
        : this.state.expandedNoteIds.concat(note.id);
      this.setState({ expandedNoteIds: updatedNoteIds });
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

    onRecordServiceClicked: function(event) {
      this.setState({
        isAddingService: true,
        serviceTypeId: null
      });
    },

    onCancelRecordServiceClicked: function(event) {
      this.setState({
        isAddingService: false,
        serviceTypeId: null
      });
    },

    onAssignedEducatorChanged: function(event) {
      console.log(event);
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
          (this.props.student.interventions.length === 0)
            ? dom.div({ style: styles.noItems }, 'No services')
            : this.renderInterventionsList()
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
      return dom.div({}, (mergedNotes.length === 0) ? dom.div({ style: styles.noItems }, 'No notes') : mergedNotes.map(function(note) {
        switch (note.version) {
          case 'v1': return this.renderV1Note(note);
          case 'v2': return this.renderV2Note(note);
        }
      }, this));
    },

    renderNoteHeader: function(header) {
      return dom.div({},
        dom.span({ style: styles.date }, header.noteMoment.format('MMMM D, YYYY')),
        header.badge,
        dom.span({ style: styles.educator }, header.educatorEl)
      );
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

    renderV2Note: function(note) {
      return dom.div({
        key: ['v2', note.id].join(),
        className: 'note',
        style: styles.note
      },
        this.renderNoteHeader({
          noteMoment: moment.utc(note.recorded_at),
          badge: this.renderEventNoteTypeBadge(note.event_note_type_id),
          educatorEl: createEl(Educator, {
            educator: this.props.educatorsIndex[note.educator_id]
          })
        }),
        dom.div({ style: { whiteSpace: 'pre-wrap' } },
          dom.div({ style: styles.expandedNote }, note.text)
        )
      );
    },

    renderV1Note: function(note) {
      return dom.div({
        key: note.id,
        className: 'note',
        style: styles.note
      },
        this.renderNoteHeader({
          noteMoment: moment.utc(note.created_at_timestamp),
          badge: dom.span({ style: styles.badge }, 'Older note'),
          educatorEl: createEl(Educator, {
            educator: this.props.educatorsIndex[note.educator_id]
          })
        }),
        dom.div({ style: { whiteSpace: 'pre-wrap' } },
          dom.div({ style: styles.expandedNote }, note.content)
        )
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
        onClick: this.onRecordServiceClicked
      }, 'Record service')
    },

    renderInterventionsList: function() {
      var sortedInterventions = _.sortBy(this.props.student.interventions, 'start_date').reverse();
      return sortedInterventions.map(this.renderIntervention);
    },

    interventionColor: function(interventionTypeId) {
      var map = {
       40: '#ffe7d6',
       41: '#ffe7d6',
       21: '#e8fce8',
       22: '#e8fce8',
       23: '#e8fce8',
       24: '#e8fce8',
       29: '#eee',
       30: '#eee',
       32: '#e8e9fc'
      };
      return map[interventionTypeId] || null;
    },

    // allow editing, fixup.  'no longer active'
    renderIntervention: function(intervention) {
      var interventionText = this.props.interventionTypesIndex[intervention.intervention_type_id].name;
      var daysText = moment.utc(intervention.start_date).fromNow(true);
      var educatorEmail = this.props.educatorsIndex[intervention.educator_id].email;
      return dom.div({
        key: intervention.id,
        style: merge(styles.intervention, { background: this.interventionColor(intervention.intervention_type_id) })
      },
        dom.div({ style: { display: 'flex' } },
          dom.div({ style: { flex: 1 } },
            dom.div({ style: { fontWeight: 'bold' } }, interventionText),
            dom.div({}, 'With ' + educatorEmail),
            dom.div({},
              'Since ',
              moment.utc(intervention.start_date).format('MMMM D, YYYY'),
              dom.span({ style: styles.daysAgo }, daysText)
            )
          )
          // TODO(kr) re-enable
          // dom.div({},
          //   dom.button({ className: 'btn', style: styles.discontinue }, 'Discontinue')
          // )
        ),
        dom.div({ style: merge(styles.userText, { paddingTop: 15 }) }, intervention.comment)
      );
    }
  });
})();