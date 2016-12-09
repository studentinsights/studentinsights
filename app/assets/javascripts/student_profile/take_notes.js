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
        attachmentUrls: []
      }
    },

    // Focus on note-taking text area when it first appears.
    componentDidMount: function(prevProps, prevState) {
      this.textareaRef.focus();
    },

    onChangeText: function(event) {
      this.setState({ text: event.target.value });
    },

    onChangeAttachmentUrl: function(changedIndex, event) {
      var newValue = event.target.value;
      var updatedAttachmentUrls = (this.state.attachmentUrls.length === changedIndex)
        ? this.state.attachmentUrls.concat(newValue)
        : this.state.attachmentUrls.map(function(attachmentUrl, index) {
          return (changedIndex === index) ? newValue : attachmentUrl;
        });
      var filteredAttachmentUrls = updatedAttachmentUrls.filter(this.stringNotEmpty);
      this.setState({ attachmentUrls: filteredAttachmentUrls });
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

    wrapUrlInObject: function(urlString) {
      return { url: urlString };
    },

    stringNotEmpty: function (urlString) {
      return urlString.length !== 0;
    },

    eventNoteUrlsForSave: function () {
      var urlsToSave = this.state.attachmentUrls.map(this.wrapUrlInObject);
      return { eventNoteAttachments: urlsToSave };
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
          'Add a link (i.e. to a file of student work on Google Drive):'
        ),
        this.renderAttachmentLinkArea(),
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
        this.state.eventNoteTypeId === null || !this.isValidAttachmentUrls()
      );
    },

    renderNoteHeader: function(header) {
      return dom.div({},
        dom.span({ style: styles.date }, header.noteMoment.format('MMMM D, YYYY')),
        '|',
        dom.span({ style: styles.educator }, header.educatorEmail)
      );
    },

    isValidAttachmentUrls: function () {
      return _.all(this.state.attachmentUrls, function (url) {
        return (url.slice(0, 7) === 'http://'  ||
                url.slice(0, 8) === 'https://' ||
                url.length      === 0);
      });
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
      var isValidUrls = this.isValidAttachmentUrls();
      var urls = (isValidUrls)
        ? this.state.attachmentUrls.concat('')
        : this.state.attachmentUrls;

      return dom.div({},
        urls.map(function (url, index) {
          return this.renderAttachmentLinkInput(url, index)
        }, this),
        dom.div({
          style: {
            fontStyle: 'italic',
            marginTop: '10px 0'
          }
        }, 'Please use the format https://www.example.com.')
      );
    },

    renderAttachmentLinkInput: function (value, index) {
      return dom.div({ key: index },
        dom.input({
          value: value,
          onChange: this.onChangeAttachmentUrl.bind(this, index),
          placeholder: 'Please use the format https://www.example.com.',
          style: {
            marginBottom: '20px',
            fontSize: 14,
            padding: 5,
            width: '100%'
          }
        })
      )
    }
  });

})();
