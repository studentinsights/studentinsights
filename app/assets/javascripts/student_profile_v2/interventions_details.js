(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;
  var ReactSelect = window.Select;
  var datepickerOptions = window.datepicker_options;

  var InterventionsDetails = window.shared.InterventionsDetails = React.createClass({
    propTypes: {
      interventionTypesIndex: React.PropTypes.object.isRequired
    },
    
    styles: {
      container: {
        display: 'flex'
      },
      notesContainer: {
        flex: 1,
        marginRight: 20
      },
      addNoteContainer: {
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
      takeNotesTextArea: {
        fontSize: 14,
        border: '1px solid #eee',
        width: '100%' //overriding strange global CSS, should cleanup
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
      recordServiceDialog: {
        border: '1px solid #ccc',
        borderRadius: 2,
        padding: 20,
        marginBottom: 20,
        marginTop: 10
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
        background: '#eee'
      },
      recordServiceTextArea: {
        fontSize: 14,
        border: '1px solid #eee',
        width: '100%' //overriding strange global CSS, should cleanup
      },
      recordServiceButton: {
        marginTop: 5
      }
    },

    getInitialState: function() {
      return {
        expandedNoteIds: [],

        isTakingNotes: false,
        takeNoteTypeId: null,
        takeNoteText: null,

        isAddingService: false,
        serviceProvidedByEducatorId: null,
        serviceTypeId: null,
        serviceText: null
      }
    },

    // Focus on note-taking text area when it first appears.
    componentDidUpdate: function(prevProps, prevState) {
      var el = ReactDOM.findDOMNode(this);
      $(el).find('.datepicker').datepicker(datepickerOptions);
      if ((prevState.takeNoteTypeId === null && prevState.takeNoteText === null) && this.isTakingNotes() && this.takeNotesTextAreaRef !== null) {
        this.takeNotesTextAreaRef.focus();
      }
    },

    isExpanded: function(note) {
      return (this.state.expandedNoteIds.indexOf(note.id) !== -1);
    },

    isTakingNotes: function() {
      return this.state.isTakingNotes;
    },

    onNoteClicked: function(note) {
      var updatedNoteIds = (this.isExpanded(note))
        ? _.without(this.state.expandedNoteIds, note.id)
        : this.state.expandedNoteIds.concat(note.id);
      this.setState({ expandedNoteIds: updatedNoteIds });
    },

    onTakeNotesClicked: function() {
      this.setState({
        isTakingNotes: true,
        takeNoteTypeId: null,
        takeNoteText: ''
      });
    },

    onNoteTypeClicked: function(noteTypeId, event) {
      this.setState({ takeNoteTypeId: noteTypeId });
    },

    onCancelTakeNotesClicked: function(event) {
      this.setState({
        isTakingNotes: false,
        takeNoteTypeId: null,
        takeNoteText: null
      });
    },

    onTakeNoteTextChanged: function(event) {
      this.setState({ takeNoteText: event.target.value });
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
      return dom.div({ className: 'InterventionsDetails', style: this.styles.container },
        dom.div({ style: this.styles.notesContainer },
          dom.h4({ style: this.styles.title}, 'Notes'),
          this.renderTakeNotes(),
          this.renderNotes()
        ),
        dom.div({ style: this.styles.interventionsContainer },
          dom.h4({ style: this.styles.title}, 'Services'),
          this.renderRecordService(),
          (this.props.student.interventions.length === 0)
            ? dom.div({ style: this.styles.noItems }, 'No services')
            : this.renderInterventionsList()
        )
      );
    },

    renderTakeNotes: function() {
      return dom.div({ style: this.styles.addNoteContainer },
        (this.isTakingNotes())
          ? this.renderTakeNoteTextbox()
          : this.renderTakeNotesButton()
      );
    },

    renderTakeNotesButton: function() {
      return dom.button({
        className: 'btn',
        onClick: this.onTakeNotesClicked
      }, 'Take notes');
    },

    renderTakeNoteTextbox: function() {
      return dom.div({},
        this.renderNoteHeader({
          noteMoment: moment(),
          educatorEmail: this.props.currentEducator.email
        }),
        dom.textarea({
          rows: 10,
          style: this.styles.takeNotesTextArea,
          ref: function(ref) { this.takeNotesTextAreaRef = ref; }.bind(this),
          value: this.state.takeNoteText,
          onChange: this.onTakeNoteTextChanged
        }),
        dom.div({ style: { marginBottom: 5, marginTop: 20 } }, 'What are these notes from?'),
        dom.div({ style: { display: 'flex' } },
          dom.div({ style: { flex: 1 } },
            this.renderNoteButton('SST meeting', 1),
            this.renderNoteButton('MTSS meeting', 2)
          ),
          dom.div({ style: { flex: 1 } },
            this.renderNoteButton('Parent conversation', 3),
            this.renderNoteButton('51a filing', 4)
          ),
          dom.div({ style: { flex: 'auto' } },
            this.renderNoteButton('Something else', 5) 
          )
        ),
        dom.button({
          style: {
            marginTop: 20,
            background: (this.state.takeNoteTypeId === null) ? '#ccc' : undefined
          },
          disabled: (this.state.takeNoteTypeId === null),
          className: 'btn',
          onClick: this.onCancelTakeNotesClicked // TODO(kr) non-functional
        }, 'Save notes'),
        dom.button({
          className: 'btn',
          style: this.styles.cancelTakeNotesButton,
          onClick: this.onCancelTakeNotesClicked
        }, 'Cancel')
      );
    },

    renderNotes: function() {
      var v1Notes = this.props.feed.v1_notes.map(function(note) { return merge(note, { version: 'v1', sort_timestamp: note.created_at_timestamp }); });
      var v2Notes = this.props.feed.v2_notes.map(function(note) { return merge(note, { version: 'v2', sort_timestamp: note.date_recorded }); });
      // TODO(kr) v1 interventions as notes
      // TODO(kr) v1 interventions progress notes as notes
      var mergedNotes = _.sortBy(v1Notes.concat(v2Notes), 'sort_timestamp').reverse();
      return dom.div({}, (mergedNotes.length === 0) ? dom.div({ style: this.styles.noItems }, 'No notes') : mergedNotes.map(function(note) {
        switch (note.version) {
          case 'v1': return this.renderV1Note(note);
          case 'v2': return this.renderV2Note(note);
        }
      }, this));
    },

    renderNoteHeader: function(header) {
      return dom.div({},
        dom.span({ style: this.styles.date }, header.noteMoment.format('MMMM D, YYYY')),
        '|',
        dom.span({ style: this.styles.educator }, header.educatorEmail)
      );
    },

    renderV2Note: function(note) {
      var styles = this.styles;
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
      var styles = this.styles;
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
      return dom.div({ style: this.styles.addServiceContainer },
        (this.state.isAddingService)
          ? this.renderRecordServiceDialog()
          : this.renderRecordServiceButton()
      );
    },

    renderRecordServiceButton: function() {
      return dom.button({
        className: 'btn',
        onClick: this.onRecordServiceClicked
      }, 'Record service delivery')
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
        style: merge(this.styles.serviceButton, {
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

    renderNoteButton: function(noteText, noteTypeId) {
      return dom.button({
        onClick: this.onNoteTypeClicked.bind(this, noteTypeId),
        tabIndex: -1,
        style: merge(this.styles.serviceButton, {
          background: '#eee',
          opacity: (this.state.takeNoteTypeId === null || this.state.takeNoteTypeId === noteTypeId) ? 1 : 0.25,
          outline: 0,
          border: (this.state.takeNoteTypeId === noteTypeId)
            ? '4px solid rgba(49, 119, 201, 0.75)'
            : '4px solid white'
        }),
        className: 'btn'
      }, noteText);
    },

    renderRecordServiceDialog: function() {
      return dom.div({ style: this.styles.recordServiceDialog },
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
          style: this.styles.recordServiceTextArea,
          // ref: function(ref) { this.takeNotesTextAreaRef = ref; }.bind(this),
          value: this.state.serviceText,
          onChange: this.onRecordServiceTextChanged
        }),
        dom.div({},
          dom.button({
            style: merge(this.styles.recordServiceButton, {
              background: (this.state.serviceTypeId === null) ? '#ccc' : undefined
            }),
            disabled: (this.state.serviceTypeId === null),
            className: 'btn',
            onClick: this.onCancelRecordServiceClicked // TODO(kr) non-functional
          }, 'Record service'),
          dom.button({
            className: 'btn',
            style: this.styles.cancelTakeNotesButton, // TODO(kr) rename
            onClick: this.onCancelRecordServiceClicked
          }, 'Cancel')
        )
      );
    },

    renderEducatorSelect: function() {
      var options = [
        { value: 1, label: 'Jill Geiser' },
        { value: 2, label: 'Uri Harel' }
      ];

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
        style: merge(this.styles.intervention, { background: this.interventionColor(intervention.intervention_type_id) })
      },
        dom.span({ style: this.styles.inlineBlock }, interventionText),
        dom.span({ style: this.styles.daysAgo }, daysText),
        dom.div({}, educatorEmail),
        dom.div({ style: merge(this.styles.userText, { paddingTop: 15 }) }, intervention.comment),
        dom.button({ className: 'btn', style: this.styles.discontinue }, 'Discontinue')
      );
    }
  });
})();