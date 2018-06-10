import _ from 'lodash';
import React from 'react';


/*
Pure UI form for taking notes about an event, tracking its own local state
and submitting it to prop callbacks.
*/
export default class TakeNotes extends React.Component {
  constructor(props) {
    super(props);

    this.onClickCancel = this.onClickCancel.bind(this);
    this.onClickSave = this.onClickSave.bind(this);
  }

  // Focus on note-taking text area when it first appears.
  componentDidMount(prevProps, prevState) {
    this.textareaRef.focus();
  }

  wrapUrlInObject(urlString) {
    return { url: urlString };
  }

  eventNoteUrlsForSave() {
    const {noteInProgressAttachmentUrls} = this.props;

    const urlsToSave = noteInProgressAttachmentUrls.map(this.wrapUrlInObject);

    return { eventNoteAttachments: urlsToSave };
  }

  disabledSaveButton() {
    const {noteInProgressType} = this.props;

    return (noteInProgressType === null || !this.isValidAttachmentUrls());
  }

  isValidAttachmentUrls() {
    const {noteInProgressAttachmentUrls} = this.props;

    return _.all(noteInProgressAttachmentUrls, url => {
      return (url.slice(0, 7) === 'http://'  ||
              url.slice(0, 8) === 'https://' ||
              url.length      === 0);
    });
  }

  onClickCancel(event) {
    this.props.onCancel();
  }

  onClickSave(event) {
    const {noteInProgressText, noteInProgressType, onSave} = this.props;

    const params = {
      eventNoteTypeId: noteInProgressType,
      text: noteInProgressText,
      ...this.eventNoteUrlsForSave()
    };

    onSave(params);
  }

  render() {
    const {
      noteInProgressText,
      nowMoment,
      requestState,
      currentEducator,
      onChangeNoteInProgressText
    } = this.props;

    return (
      <div className="TakeNotes" style={styles.dialog}>
        {this.renderNoteHeader({
          noteMoment: nowMoment,
          educatorEmail: currentEducator.email
        })}
        <textarea
          className="TakeNotes-textarea"
          rows={10}
          style={styles.textarea}
          ref={ref => this.textareaRef = ref}
          value={noteInProgressText}
          onChange={onChangeNoteInProgressText} />
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
        {(requestState === 'pending') ? <span>
          Saving...
        </span> : null}
        {(requestState === 'error') ? <span>
          Try again!
        </span> : null}
      </div>
    );
  }

  renderNoteHeader(header) {
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
  }

  // TODO(kr) extract button UI
  renderNoteButton(eventNoteTypeId) {
    const {
      onClickNoteType,
      eventNoteTypesIndex,
      noteInProgressType
    } = this.props;

    const eventNoteType = eventNoteTypesIndex[eventNoteTypeId];

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
        {eventNoteType.name}
      </button>
    );
  }

  renderAttachmentLinkArea() {
    const {noteInProgressAttachmentUrls} = this.props;
    const isValidUrls = this.isValidAttachmentUrls();

    const urls = (isValidUrls)
      ? noteInProgressAttachmentUrls.concat('')
      : noteInProgressAttachmentUrls;

    return (
      <div>
        {urls.map((url, index) => this.renderAttachmentLinkInput(url, index))}
        <div
          style={{
            fontStyle: 'italic',
            marginTop: '10px 0'
          }}>
          Please use the format https://www.example.com.
        </div>
      </div>
    );
  }

  renderAttachmentLinkInput(value, index) {
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
}
TakeNotes.propTypes = {
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
};


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
