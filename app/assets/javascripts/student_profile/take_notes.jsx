import _ from 'lodash';
import React from 'react';
import {eventNoteTypeText} from '../components/eventNoteType';

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
    requestState: React.PropTypes.string, // or null

    noteInProgressText: React.PropTypes.string.isRequired,
    noteInProgressType: React.PropTypes.number,
    noteInProgressAttachmentUrls: React.PropTypes.arrayOf(
      React.PropTypes.string
    ).isRequired,

    onClickNoteType: React.PropTypes.func.isRequired,
    onChangeNoteInProgressText: React.PropTypes.func.isRequired,
    onChangeAttachmentUrl: React.PropTypes.func.isRequired,
  },

  // Focus on note-taking text area when it first appears.
  componentDidMount: function(prevProps, prevState) {
    this.textareaRef.focus();
  },

  wrapUrlInObject: function(urlString) {
    return { url: urlString };
  },

  eventNoteUrlsForSave: function () {
    const {noteInProgressAttachmentUrls} = this.props;

    const urlsToSave = noteInProgressAttachmentUrls.map(this.wrapUrlInObject);

    return { eventNoteAttachments: urlsToSave };
  },

  disabledSaveButton: function () {
    const {noteInProgressType} = this.props;

    return (noteInProgressType === null || !this.isValidAttachmentUrls());
  },

  noteText() {
    // In most cases, display the text the user has entered into the controlled
    // text input, passed in as props. When the user is a counselor entering a
    // High School Transition Note, show an initial prompt.

    const {noteInProgressText, noteInProgressType} = this.props;

    if (noteInProgressType !== 307) return noteInProgressText;

    if (noteInProgressText !== '') return noteInProgressText;

    // Prompt for High School Transition Note
    return `What are this student's strengths?
——————————


What is this student's involvement in the school community like?
——————————


How does this student relate to their peers?
——————————


Is this student receiving Social Services and if so, what is the name and contact info of their social worker?
——————————


Is this student receiving mental health supports?
——————————


Any additional comments or good things to know about this student?
——————————


    `;
  },

  isValidAttachmentUrls: function () {
    const {noteInProgressAttachmentUrls} = this.props;

    return _.all(noteInProgressAttachmentUrls, function (url) {
      return (url.slice(0, 7) === 'http://'  ||
              url.slice(0, 8) === 'https://' ||
              url.length      === 0);
    });
  },

  onClickCancel: function(event) {
    this.props.onCancel();
  },

  onClickSave: function(event) {
    const {noteInProgressText, noteInProgressType} = this.props;

    const params = {
      eventNoteTypeId: noteInProgressType,
      text: noteInProgressText,
      ...this.eventNoteUrlsForSave()
    };

    this.props.onSave(params);
  },

  render: function() {
    const {currentEducator} = this.props;

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
          value={this.noteText()}
          onChange={this.props.onChangeNoteInProgressText} />
        <div style={{ marginBottom: 5, marginTop: 20 }}>
          What are these notes from?
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1 }}>
            {this.renderNoteButton(300)}
            {this.renderNoteButton(301)}
            {this.renderNoteButton(305)}
          </div>
          <div style={{ flex: 1 }}>
            {this.renderNoteButton(306)}
            {this.renderNoteButton(302)}
            {currentEducator.is_counselor && this.renderNoteButton(307)}
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
    const {
      onClickNoteType,
      noteInProgressType
    } = this.props;

    return (
      <button
        className="btn note-type"
        onClick={onClickNoteType}
        tabIndex={-1}
        name={eventNoteTypeId}
        style={{
          ...styles.serviceButton,
          background: '#eee',
          outline: 0,
          border: (noteInProgressType === eventNoteTypeId)
            ? '4px solid rgba(49, 119, 201, 0.75)'
            : '4px solid white'
        }}>
        {eventNoteTypeText(eventNoteTypeId)}
      </button>
    );
  },

  renderAttachmentLinkArea: function () {
    const {noteInProgressAttachmentUrls} = this.props;
    const isValidUrls = this.isValidAttachmentUrls();

    const urls = (isValidUrls)
      ? noteInProgressAttachmentUrls.concat('')
      : noteInProgressAttachmentUrls;

    return (
      <div>
        {urls.map((url, index) => {
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
    const {onChangeAttachmentUrl} = this.props;

    return (
      <div key={index}>
        <input
          value={value}
          name={index}
          onChange={onChangeAttachmentUrl}
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
