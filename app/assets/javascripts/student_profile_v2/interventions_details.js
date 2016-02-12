(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;
  
  var ReactSelect = window.Select;
  var datepickerOptions = window.datepicker_options;
  var TakeNotes = window.shared.TakeNotes;
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
    serviceButton: {
      background: '#eee', // override CSS
      color: 'black',
      // shrinking:
      width: '12em',
      fontSize: 12,
      padding: 8
    },
    discontinue: {
      background: 'white',
      opacity: 0.5,
      border: '1px solid #ccc',
      color: '#666'
    },
    recordServiceTextArea: {
      fontSize: 14,
      border: '1px solid #eee',
      width: '100%' //overriding strange global CSS, should cleanup
    },
    recordServiceButton: {
      marginTop: 5
    }
  };


  var InterventionsDetails = window.shared.InterventionsDetails = React.createClass({
    propTypes: {
      interventionTypesIndex: React.PropTypes.object.isRequired,
      actions: PropTypes.actions.isRequired
    },

    getInitialState: function() {
      return {
        expandedNoteIds: [],

        isTakingNotes: false,

        isAddingService: false,
        serviceProvidedByEducatorId: null,
        serviceTypeId: null,
        serviceText: null
      }
    },

    componentDidUpdate: function(prevProps, prevState) {
      var el = ReactDOM.findDOMNode(this);
      $(el).find('.datepicker').datepicker(datepickerOptions);
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
        serviceTypeId: null,
        serviceText: null
      });
    },

    onCancelRecordServiceClicked: function(event) {
      this.setState({
        isAddingService: false,
        serviceTypeId: null,
        serviceText: null
      });
    },

    onRecordServiceTextChanged: function(event) {
      this.setState({ serviceText: event.target.value });
    },

    onServiceClicked: function(interventionTypeId, event) {
      this.setState({ serviceTypeId: interventionTypeId });
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
          this.renderRecordService(),
          (this.props.student.interventions.length === 0)
            ? dom.div({ style: styles.noItems }, 'No services')
            : this.renderInterventionsList()
        )
      );
    },

    renderTakeNotesSection: function() {
      if (this.state.isTakingNotes || this.props.requests.saveNotes !== null) {
        return createEl(TakeNotes, {
          nowMoment: moment(), // TODO(kr) thread through
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
      var v1Notes = this.props.feed.v1_notes.map(function(note) { return merge(note, { version: 'v1', sort_timestamp: note.created_at_timestamp }); });
      var v2Notes = this.props.feed.event_notes.map(function(note) { return merge(note, { version: 'v2', sort_timestamp: note.date_recorded }); });
      // TODO(kr) v1 interventions as notes
      // TODO(kr) v1 interventions progress notes as notes
      var mergedNotes = _.sortBy(v1Notes.concat(v2Notes), 'sort_timestamp').reverse();
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
        '|',
        dom.span({ style: styles.educator }, header.educatorEmail)
      );
    },

    renderV2Note: function(note) {
      var educatorEmail = this.props.educatorsIndex[note.educator_id].email;
      return dom.div({
        key: ['v2', note.id].join(),
        style: styles.note
      },
        this.renderNoteHeader({
          noteMoment: moment(note.date_recorded),
          educatorEmail: educatorEmail
        }),
        dom.div({ style: { whiteSpace: 'pre-wrap' } },
          dom.div({ style: styles.expandedNote }, note.text)
        )
      );
    },

    renderV1Note: function(note) {
      return dom.div({
        key: note.id,
        style: styles.note
      },
        this.renderNoteHeader({
          noteMoment: moment(note.created_at_timestamp),
          educatorEmail: note.educator_email
        }),
        dom.div({ style: { whiteSpace: 'pre-wrap' } },
          dom.div({ style: styles.expandedNote }, note.content)
        )
      );
    },

    renderRecordService: function() {
      return dom.div({ style: styles.addServiceContainer },
        (this.state.isAddingService)
          ? this.renderRecordServiceDialog()
          : this.renderRecordServiceButton()
      );
    },

    renderRecordServiceButton: function() {
      return dom.button({
        className: 'btn record-service',
        onClick: this.onRecordServiceClicked
      }, 'Record service')
    },

    renderServiceButton: function(interventionTypeId, options) {
      var serviceNameMap = {
        29: 'Counseling, in-house',
        30: 'Counseling, outside',
        41: 'Reading intervention',
        32: 'Math intervention'
      };
      var intervention = this.props.interventionTypesIndex[interventionTypeId];
      var serviceText = serviceNameMap[interventionTypeId] || intervention.name;
      var color = this.interventionColor(interventionTypeId);

      return dom.button({
        onClick: this.onServiceClicked.bind(this, interventionTypeId),
        tabIndex: -1,
        style: merge(styles.serviceButton, {
          background: color,
          opacity: (this.state.serviceTypeId === null || this.state.serviceTypeId === interventionTypeId) ? 1 : 0.25,
          outline: 0,
          border: (this.state.serviceTypeId === interventionTypeId)
            ? '4px solid rgba(49, 119, 201, 0.75)'
            : '4px solid white'
        }),
        className: 'btn'
      }, serviceText);
    },

    renderRecordServiceDialog: function() {
      return dom.div({ style: styles.dialog },
        dom.div({ style: { marginBottom: 5 } }, 'Which service?'),
        dom.div({ style: { display: 'flex' } },
          dom.div({ style: { flex: 1 } },
            this.renderServiceButton(29),
            this.renderServiceButton(30)
          ),
          dom.div({ style: { flex: 1 } },
            this.renderServiceButton(41),
            this.renderServiceButton(32)
          ),
          dom.div({ style: { flex: 'auto' } },
            this.renderServiceButton(21),
            this.renderServiceButton(22),
            this.renderServiceButton(23)
          )
        ),
        dom.div({ style: { marginTop: 20 } },
          dom.div({}, 'Who is working with ' + this.props.student.first_name + '?'),
          dom.div({ style: { width: '50%' } }, this.renderEducatorSelect())
          // dom.span({ style: { fontSize: 12, color: '#666', marginLeft: 5, marginRight: 5 } }, ' starting on '),
          // dom.input({ style: { fontSize: 14 }, defaultValue: moment().format('MM/DD/YYYY') })
        ),
        dom.div({ style: { marginTop: 20 } }, 'When did they start?'),
        dom.input({ className: 'datepicker', style: { fontSize: 14, padding: 5, width: '50%' }, defaultValue: moment().format('MM/DD/YYYY') }),
        dom.div({ style: { marginTop: 15 } }, 'Any other context?'),
        dom.textarea({
          rows: 3,
          style: styles.recordServiceTextArea,
          // ref: function(ref) { this.takeNotesTextAreaRef = ref; }.bind(this),
          value: this.state.serviceText,
          onChange: this.onRecordServiceTextChanged
        }),
        dom.div({},
          dom.button({
            style: merge(styles.recordServiceButton, {
              background: '#ccc' // TODO(kr) (this.state.serviceTypeId === null) ? '#ccc' : undefined
            }),
            disabled: true, // TODO(kr) (this.state.serviceTypeId === null),
            className: 'btn',
            onClick: this.onCancelRecordServiceClicked // TODO(kr) non-functional
          }, 'Record service'),
          dom.button({
            className: 'btn',
            style: styles.cancelTakeNotesButton, // TODO(kr) rename
            onClick: this.onCancelRecordServiceClicked
          }, 'Cancel')
        )
      );
    },

    renderEducatorSelect: function() {
      // TODO(kr) convert to names, are those in Aspen?
      var options = _.values(this.props.educatorsIndex).map(function(educator) {
        return { value: educator.id, label: educator.email.split('@')[0] };
      });

      return createEl(ReactSelect, {
        name: 'assigned-educator-select',
        clearable: false,
        placeholder: 'Type name..',
        value: this.state.serviceProvidedByEducatorId,
        options: options,
        onChange: this.onAssignedEducatorChanged
      });
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
      var daysText = moment(intervention.start_date).fromNow(true);
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
              moment(intervention.start_date).format('MMMM D, YYYY'),
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