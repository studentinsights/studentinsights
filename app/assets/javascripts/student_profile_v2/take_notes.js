(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var PropTypes = window.shared.PropTypes;

  var styles = {
    dialog: {
      border: '1px solid #ccc',
      borderRadius: 2,
      padding: 20,
      marginBottom: 20,
      marginTop: 10
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
    textarea: {
      fontSize: 14,
      border: '1px solid #eee',
      width: '100%' //overriding strange global CSS, should cleanup
    },
    cancelTakeNotesButton: { // overidding CSS
      color: 'black',
      background: '#eee',
      marginLeft: 10,
      marginRight: 10
    },
    serviceButton: {
      background: '#eee', // override CSS
      color: 'black',
      // shrinking:
      width: '12em',
      fontSize: 12,
      padding: 8
    }
  };


  /*
  Pure UI form for taking notes about an event, tracking its own local state
  and submitting it to prop callbacks.
  */
  var TakeNotes = window.shared.TakeNotes = React.createClass({
    propTypes: {
      nowMoment: React.PropTypes.object.isRequired,
      onSave: React.PropTypes.func.isRequired,
      onCancel: React.PropTypes.func.isRequired,
      currentEducator: React.PropTypes.object.isRequired,
      requestState: PropTypes.nullable(React.PropTypes.string.isRequired)
    },

    getInitialState: function() {
      return {
        eventNoteTypeId: null,
        text: null
      }
    },

    // Focus on note-taking text area when it first appears.
    componentDidMount: function(prevProps, prevState) {
      this.textareaRef.focus();
    },

    onChangeText: function(event) {
      this.setState({ text: event.target.value });
    },

    onClickNoteType: function(noteTypeId, event) {
      this.setState({ eventNoteTypeId: noteTypeId });
    },

    onClickCancel: function(event) {
      this.props.onCancel();
    },

    onClickSave: function(event) {
      var params = _.pick(this.state, 'eventNoteTypeId', 'text');
      this.props.onSave(params);
    },

    render: function() {
      return dom.div({ className: 'TakeNotes', style: styles.dialog },
        this.renderNoteHeader({
          noteMoment: this.props.nowMoment,
          educatorEmail: this.props.currentEducator.email
        }),
        dom.textarea({
          rows: 10,
          style: styles.textarea,
          ref: function(ref) { this.textareaRef = ref; }.bind(this),
          value: this.state.text,
          onChange: this.onChangeText
        }),
        dom.div({ style: { marginBottom: 5, marginTop: 20 } }, 'What are these notes from?'),
        dom.div({ style: { display: 'flex' } },
          dom.div({ style: { flex: 1 } },
            this.renderNoteButton('SST meeting', 1),
            this.renderNoteButton('MTSS meeting', 2)
          ),
          dom.div({ style: { flex: 1 } },
            this.renderNoteButton('Family conversation', 3)
          ),
          dom.div({ style: { flex: 'auto' } },
            this.renderNoteButton('Something else', 5) 
          )
        ),
        dom.button({
          style: {
            marginTop: 20,
            background: (this.state.eventNoteTypeId === null) ? '#ccc' : undefined
          },
          disabled: (this.state.eventNoteTypeId === null),
          className: 'btn save',
          onClick: this.onClickSave
        }, 'Save notes'),
        dom.button({
          className: 'btn cancel',
          style: styles.cancelTakeNotesButton,
          onClick: this.onClickCancel
        }, 'Cancel'),
        (this.props.requestState === 'pending') ? dom.span({}, 'Saving...') : null,
        (this.props.requestState === 'error') ? dom.span({}, 'Try again!') : null
      );
    },

    // TODO(kr) extract
    renderNoteHeader: function(header) {
      return dom.div({},
        dom.span({ style: styles.date }, header.noteMoment.format('MMMM D, YYYY')),
        '|',
        dom.span({ style: styles.educator }, header.educatorEmail)
      );
    },

    // TODO(kr) extract
    renderNoteButton: function(noteText, noteTypeId) {
      return dom.button({
        className: 'btn note-type',
        onClick: this.onClickNoteType.bind(this, noteTypeId),
        tabIndex: -1,
        style: merge(styles.serviceButton, {
          background: '#eee',
          opacity: (this.state.eventNoteTypeId === null || this.state.eventNoteTypeId === noteTypeId) ? 1 : 0.25,
          outline: 0,
          border: (this.state.eventNoteTypeId === noteTypeId)
            ? '4px solid rgba(49, 119, 201, 0.75)'
            : '4px solid white'
        })
      }, noteText);
    }
  });
})();