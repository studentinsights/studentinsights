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
    input: {
      fontSize: 14,
      border: '1px solid #eee',
      width: '100%'
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
      eventNoteTypesIndex: React.PropTypes.object.isRequired,
      onSave: React.PropTypes.func.isRequired,
      onCancel: React.PropTypes.func.isRequired,
      currentEducator: React.PropTypes.object.isRequired,
      requestState: PropTypes.nullable(React.PropTypes.string.isRequired)
    },

    getInitialState: function() {
      return {
        eventNoteTypeId: null,
        text: null,
        eventNoteAttachments: {},
      }
    },

    // Focus on note-taking text area when it first appears.
    componentDidMount: function(prevProps, prevState) {
      this.textareaRef.focus();
    },

    onChangeText: function(event) {
      this.setState({ text: event.target.value });
    },

    onChangeAttachmentUrl: function (event) {
      var id = event.target.id;
      var eventNoteAttachments = this.state.eventNoteAttachments;

      eventNoteAttachments[id] = event.target.value;
      this.setState({ eventNoteAttachments: eventNoteAttachments });
    },

    onClickNoteType: function(noteTypeId, event) {
      this.setState({ eventNoteTypeId: noteTypeId });
    },

    onClickCancel: function(event) {
      this.props.onCancel();
    },

    onClickSave: function(event) {
      var params = merge(
        _.pick(this.state, 'eventNoteTypeId', 'text'),
        this.eventNoteUrlsForSave()
      );

      this.props.onSave(params);
    },

    eventNoteUrlsForSave: function () {
      var eventNoteAttachmentUrls = Object.values(this.state.eventNoteAttachments);

      var wrappedUrls = eventNoteAttachmentUrls.map(function(url) { return { url: url }; });

      return { eventNoteAttachments: wrappedUrls };
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
            this.renderNoteButton(300),
            this.renderNoteButton(301)
          ),
          dom.div({ style: { flex: 1 } },
            this.renderNoteButton(302)
          ),
          dom.div({ style: { flex: 'auto' } },
            this.renderNoteButton(304)
          )
        ),
        dom.div({ style: { marginBottom: 5, marginTop: 20 } },
          'Add a link (i.e. to an attachment on Google Drive):'
        ),
        this.renderAttachmentLinkArea(),
        dom.br({}),
        this.renderLinkFormatReminder(),
        dom.button({
          style: {
            marginTop: 20,
            background: (this.disabledSaveButton()) ? '#ccc' : undefined
          },
          disabled: (this.disabledSaveButton()),
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

    disabledSaveButton: function () {
      return (
        this.state.eventNoteTypeId === null || !this.validAttachmentUrls()
      );
    },

    renderNoteHeader: function(header) {
      return dom.div({},
        dom.span({ style: styles.date }, header.noteMoment.format('MMMM D, YYYY')),
        '|',
        dom.span({ style: styles.educator }, header.educatorEmail)
      );
    },

    validAttachmentUrls: function () {
      var urls = Object.values(this.state.eventNoteAttachments);
      if (urls === []) return true;

      return urls.map(function (url) {
        return (url.slice(0, 7) === 'http://' ||
                url.slice(0, 8) === 'https://');
      }).reduce(function (a, b) { return a && b }, true);
    },

    // TODO(kr) extract button UI
    renderNoteButton: function(eventNoteTypeId) {
      var eventNoteType = this.props.eventNoteTypesIndex[eventNoteTypeId];
      return dom.button({
        className: 'btn note-type',
        onClick: this.onClickNoteType.bind(this, eventNoteTypeId),
        tabIndex: -1,
        style: merge(styles.serviceButton, {
          background: '#eee',
          outline: 0,
          border: (this.state.eventNoteTypeId === eventNoteTypeId)
            ? '4px solid rgba(49, 119, 201, 0.75)'
            : '4px solid white'
        })
      }, eventNoteType.name);
    },

    renderAttachmentLinkArea: function () {
      var self = this;
      var urls = Object.values(this.state.eventNoteAttachments);

      return dom.div({},
        urls.map(function (url, index) {
          return self.renderAttachmentLinkInput(
            url,
            'link-attachment-input-' + String(index),
            (index === urls.length - 1)
          )
        }),
        this.renderNewAttachmentLinkInput(
          '', 'link-attachment-input-' + String(urls.length), false
        )
      )
    },

    renderAttachmentLinkInput: function (value, id, autofocus) {
      return dom.div({},
        dom.input({
          id: id,
          value: value,
          style: styles.input,
          onInput: this.onChangeAttachmentUrl,
          placeholder: 'Please use the format https://www.example.com.',
          autoFocus: autofocus,
          style: {
            marginBottom: '10px'
          }
        }),
        dom.br({})
      )
    },

    renderNewAttachmentLinkInput: function (value, id, autofocus) {
      if (!this.validAttachmentUrls()) return null;

      return this.renderAttachmentLinkInput(value, id, autofocus);
    },

    renderLinkFormatReminder: function () {
      if (this.validAttachmentUrls()) return null;

      return dom.div({
          style: {
            fontStyle: 'italic',
            marginTop: '20px'
          }
        },
        'Please use the format https://www.example.com.'
      );
    },

  });

})();
