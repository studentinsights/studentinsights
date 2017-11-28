import _ from 'lodash';
import {merge} from '../helpers/ReactHelpers';

window.shared || (window.shared = {});

const styles = {
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
    minWidth: '14em',
    fontSize: 12,
    marginRight: '1em',
    padding: 8
  }
};


/*
Pure UI form for taking notes about an event, tracking its own local state
and submitting it to prop callbacks.
*/
export default React.createClass({
  displayName: 'TakeNotes',

  propTypes: {
    nowMoment: React.PropTypes.object.isRequired,
    eventNoteTypesIndex: React.PropTypes.object.isRequired,
    onSave: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    currentEducator: React.PropTypes.object.isRequired,
    requestState: React.PropTypes.string // or null
  },

  getInitialState: function() {
    return {
      eventNoteTypeId: null,
      text: '',
      attachmentUrls: []
    };
  },

  // Focus on note-taking text area when it first appears.
  componentDidMount: function(prevProps, prevState) {
    this.textareaRef.focus();
  },

  wrapUrlInObject: function(urlString) {
    return { url: urlString };
  },

  stringNotEmpty: function (urlString) {
    return urlString.length !== 0;
  },

  eventNoteUrlsForSave: function () {
    const urlsToSave = this.state.attachmentUrls.map(this.wrapUrlInObject);
    return { eventNoteAttachments: urlsToSave };
  },

  disabledSaveButton: function () {
    return (
      this.state.eventNoteTypeId === null || !this.isValidAttachmentUrls()
    );
  },

  isValidAttachmentUrls: function () {
    return _.all(this.state.attachmentUrls, function (url) {
      return (url.slice(0, 7) === 'http://'  ||
              url.slice(0, 8) === 'https://' ||
              url.length      === 0);
    });
  },

  onChangeText: function(event) {
    this.setState({ text: event.target.value });
  },

  onChangeAttachmentUrl: function(changedIndex, event) {
    const newValue = event.target.value;
    const updatedAttachmentUrls = (this.state.attachmentUrls.length === changedIndex)
      ? this.state.attachmentUrls.concat(newValue)
      : this.state.attachmentUrls.map(function(attachmentUrl, index) {
        return (changedIndex === index) ? newValue : attachmentUrl;
      });
    const filteredAttachmentUrls = updatedAttachmentUrls.filter(this.stringNotEmpty);
    this.setState({ attachmentUrls: filteredAttachmentUrls });
  },

  onClickNoteType: function(noteTypeId, event) {
    this.setState({ eventNoteTypeId: noteTypeId });
  },

  onClickCancel: function(event) {
    this.props.onCancel();
  },

  onClickSave: function(event) {
    const params = merge(
      _.pick(this.state, 'eventNoteTypeId', 'text'),
      this.eventNoteUrlsForSave()
    );

    this.props.onSave(params);
  },

  render: function() {
    return (
      <div className="TakeNotes" style={styles.dialog}>
        {this.renderNoteHeader({
          noteMoment: this.props.nowMoment,
          educatorEmail: this.props.currentEducator.email
        })}
        <textarea
          rows={10}
          style={styles.textarea}
          ref={function(ref) { this.textareaRef = ref; }.bind(this)}
          value={this.state.text}
          onChange={this.onChangeText} />
        <div style={{ marginBottom: 5, marginTop: 20 }}>
          What are these notes from?
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1 }}>
            {this.renderNoteButton(300)}
            {this.renderNoteButton(301)}
          </div>
          <div style={{ flex: 1 }}>
            {this.renderNoteButton(305)}
            {this.renderNoteButton(306)}
          </div>
          <div style={{ flex: 1 }}>
            {this.renderNoteButton(302)}
            {this.renderNoteButton(304)}
          </div>
        </div>
        <div style={{ marginBottom: 5, marginTop: 20 }}>
          Add a link (i.e. to a file of student work on Google Drive):
        </div>
        {this.renderAttachmentLinkArea()}
        <button
          style={{
            marginTop: 20,
            background: (this.disabledSaveButton()) ? '#ccc' : undefined
          }}
          disabled={this.disabledSaveButton()}
          className="btn save"
          onClick={this.onClickSave}>
          Save notes
        </button>
        <button
          className="btn cancel"
          style={styles.cancelTakeNotesButton}
          onClick={this.onClickCancel}>
          Cancel
        </button>
        {(this.props.requestState === 'pending') ? <span>
          Saving...
        </span> : null}
        {(this.props.requestState === 'error') ? <span>
          Try again!
        </span> : null}
      </div>
    );
  },

  renderNoteHeader: function(header) {
    return (
      <div>
        <span style={styles.date}>
          {header.noteMoment.format('MMMM D, YYYY')}
        </span>
        |
        <span style={styles.educator}>
          {header.educatorEmail}
        </span>
      </div>
    );
  },

  // TODO(kr) extract button UI
  renderNoteButton: function(eventNoteTypeId) {
    const eventNoteType = this.props.eventNoteTypesIndex[eventNoteTypeId];
    return (
      <button
        className="btn note-type"
        onClick={this.onClickNoteType.bind(this, eventNoteTypeId)}
        tabIndex={-1}
        style={merge(styles.serviceButton, {
          background: '#eee',
          outline: 0,
          border: (this.state.eventNoteTypeId === eventNoteTypeId)
            ? '4px solid rgba(49, 119, 201, 0.75)'
            : '4px solid white'
        })}>
        {eventNoteType.name}
      </button>
    );
  },

  renderAttachmentLinkArea: function () {
    const isValidUrls = this.isValidAttachmentUrls();
    const urls = (isValidUrls)
      ? this.state.attachmentUrls.concat('')
      : this.state.attachmentUrls;

    return (
      <div>
        {urls.map(function (url, index) {
          return this.renderAttachmentLinkInput(url, index);
        }, this)}
        <div
          style={{
            fontStyle: 'italic',
            marginTop: '10px 0'
          }}>
          Please use the format https://www.example.com.
        </div>
      </div>
    );
  },

  renderAttachmentLinkInput: function (value, index) {
    return (
      <div key={index}>
        <input
          value={value}
          onChange={this.onChangeAttachmentUrl.bind(this, index)}
          placeholder="Please use the format https://www.example.com."
          style={{
            marginBottom: '20px',
            fontSize: 14,
            padding: 5,
            width: '100%'
          }} />
      </div>
    );
  }
});
