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
        flex: 1
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
      expandedNote: {},
      collapsedNote: {
        maxHeight: '2em',
        overflowY: 'hidden'
      }
    },

    getInitialState: function() {
      return {
        expandedNoteIds: []
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

    render: function() {
      return dom.div({ className: 'InterventionsDetails', style: this.styles.container },
        dom.div({ style: this.styles.notesContainer },
          dom.div({ style: this.styles.title}, 'Notes'),
          (this.props.notes.length === 0) ? 'No notes' : this.props.notes.map(this.renderNote)
        ),
        dom.div({ style: this.styles.interventionsContainer },
          dom.div({ style: this.styles.title}, 'Interventions'),
          (this.props.student.interventions.length === 0) ? 'No interventions' : this.props.student.interventions.map(this.renderIntervention)
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
    },

    renderNote: function(note) {
      var styles = this.styles;
      var isExpanded = this.isExpanded(note);
      return dom.div({
        key: note.id,
        onClick: this.onNoteClicked.bind(this, note),
      },
        dom.div({},
          dom.span({ style: styles.date }, moment(note.created_at_timestamp).format('MMMM D, YYYY')),
          '|',
          dom.span({ style: styles.educator }, note.educator_email)
        ),
        dom.div({ style: { whiteSpace: 'pre-wrap' } },
          dom.div({ style: (isExpanded) ? styles.expandedNote : styles.collapsedNote }, note.content),
          (isExpanded ? null : dom.div({}, '(see more)'))
        )
      );
    }
  });
})();