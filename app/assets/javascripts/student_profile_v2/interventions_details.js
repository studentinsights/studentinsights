(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

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
      interventionsContainer: {
        flex: 1
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
        fontWeight: 'bold',
        padding: 10,
        paddingLeft: 0
      },
      date: {
        padding: 10,
        paddingLeft: 0,
        fontWeight: 'bold',
        display: 'inline-block'
      },
      educator: {
        padding: 10,
        paddingLeft: 5,
        display: 'inline-block'
      },
      note: {
        border: '1px solid #eee',
        padding: 10,
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
      expandedNote: {},
      collapsedNote: {
        maxHeight: '2em',
        overflowY: 'hidden'
      }
    },

    getInitialState: function() {
      return {
        expandedNoteIds: [],
        takeNoteTypeId: null,
        takeNoteText: null
      }
    },

    // Focus on note-taking text area when it first appears.
    componentDidUpdate: function(prevProps, prevState) {
      if ((prevState.takeNoteTypeId === null && prevState.takeNoteText === null) && this.isTakingNotes() && this.takeNotesTextAreaRef !== null) {
        this.takeNotesTextAreaRef.focus();
      }
    },

    isExpanded: function(note) {
      return (this.state.expandedNoteIds.indexOf(note.id) !== -1);
    },

    isTakingNotes: function() {
      return (this.state.takeNoteTypeId !== null && this.state.takeNoteText !== null);
    },

    onNoteClicked: function(note) {
      var updatedNoteIds = (this.isExpanded(note))
        ? _.without(this.state.expandedNoteIds, note.id)
        : this.state.expandedNoteIds.concat(note.id);
      this.setState({ expandedNoteIds: updatedNoteIds });
    },

    onTakeNotesClicked: function() {
      this.setState({
        takeNoteTypeId: 1,
        takeNoteText: ''
      });
    },

    onCancelTakeNotesClicked: function(event) {
      this.setState({
        takeNoteTypeId: null,
        takeNoteText: null
      });
    },

    onTakeNoteTextChanged: function(event) {
      this.setState({ takeNoteText: event.target.value });
    },

    render: function() {
      return dom.div({ className: 'InterventionsDetails', style: this.styles.container },
        dom.div({ style: this.styles.notesContainer },
          dom.div({ style: this.styles.title}, 'Notes'),
          this.renderTakeNotes(),
          this.renderNotes()
        ),
        dom.div({ style: this.styles.interventionsContainer },
          dom.div({ style: this.styles.title}, 'Interventions'),
          (this.props.student.interventions.length === 0) ? 'No interventions' : this.props.student.interventions.map(this.renderIntervention)
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
          educatorEmail: 'me@hello.com'
        }),
        dom.textarea({
          rows: 10,
          style: this.styles.takeNotesTextArea,
          ref: function(ref) { this.takeNotesTextAreaRef = ref; }.bind(this),
          value: this.state.takeNoteText,
          onChange: this.onTakeNoteTextChanged
        }),
        dom.button({ className: 'btn' }, 'Save notes'),
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
      return dom.div({}, (mergedNotes.length === 0) ? 'No notes' : mergedNotes.map(function(note) {
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
      var isExpanded = this.isExpanded(note);
      return dom.div({
        key: note.id,
        style: styles.note,
        onClick: this.onNoteClicked.bind(this, note),
      },
        this.renderNoteHeader({
          noteMoment: moment(note.created_at_timestamp),
          educatorEmail: note.educator_email
        }),
        dom.div({ style: { whiteSpace: 'pre-wrap' } },
          dom.div({ style: (isExpanded) ? styles.expandedNote : styles.collapsedNote }, note.content),
          (isExpanded ? null : dom.div({}, '(see more)'))
        )
      );
    },

    // allow editing, fixup.  'no longer active'
    renderIntervention: function(intervention) {
      var interventionText = this.props.interventionTypesIndex[intervention.intervention_type_id].name;
      var daysText = moment(intervention.start_date).fromNow(true);
      return dom.div({ key: intervention.id },
        dom.span({ style: this.styles.inlineBlock }, interventionText),
        dom.span({ style: this.styles.daysAgo }, daysText),
        dom.div({}, 'Teacher ' + intervention.educator_id), // TODO(kr)
        dom.div({ style: merge(this.styles.userText, { paddingTop: 15 }) }, intervention.comment)
      );
    }
  });
})();