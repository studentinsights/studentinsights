import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {takeNotesChoices} from '../helpers/PerDistrict';
import {eventNoteTypeText} from '../helpers/eventNoteType';


/*
Pure UI form for taking notes about an event, tracking its own local state
and submitting it to prop callbacks.
*/
export default class DraftNote extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isRestricted: false,
      text: '',
      eventNoteTypeId: null,
      noteInProgressAttachmentUrls: []
    };
    this.onRestrictedToggled = this.onRestrictedToggled.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
    this.onClickSave = this.onClickSave.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
    this.onClickNoteType = this.onClickNoteType.bind(this);
    this.onChangeAttachmentUrl = this.onChangeAttachmentUrl.bind(this);
  }

  // Focus on note-taking text area when it first appears.
  componentDidMount(prevProps, prevState) {
    this.textareaRef.focus();
  }

  wrapUrlInObject(urlString) {
    return { url: urlString };
  }

  eventNoteUrlsForSave() {
    const {noteInProgressAttachmentUrls} = this.state;

    const urlsToSave = noteInProgressAttachmentUrls.map(this.wrapUrlInObject);

    return { eventNoteAttachments: urlsToSave };
  }

  disabledSaveButton() {
    const {text, eventNoteTypeId} = this.state;

    return (text === '' || eventNoteTypeId === null || !this.isValidAttachmentUrls());
  }

  isValidAttachmentUrls() {
    const {noteInProgressAttachmentUrls} = this.state;

    return _.every(noteInProgressAttachmentUrls, url => {
      return (url.slice(0, 7) === 'http://'  ||
              url.slice(0, 8) === 'https://' ||
              url.length      === 0);
    });
  }

  onChangeAttachmentUrl(changedIndex, event) {
    const {noteInProgressAttachmentUrls} = this.state;

    const newValue = event.target.value;
    const updatedAttachmentUrls = (noteInProgressAttachmentUrls.length === changedIndex)
      ? noteInProgressAttachmentUrls.concat(newValue)
      : noteInProgressAttachmentUrls.map((attachmentUrl, index) => {
        return (changedIndex === index) ? newValue : attachmentUrl;
      });

    const filteredAttachments = updatedAttachmentUrls.filter((urlString) => {
      return urlString.length !== 0;
    });

    this.setState({ noteInProgressAttachmentUrls: filteredAttachments });
  }

  onChangeText(e) {
    this.setState({text: e.target.value});
  }

  onClickNoteType(eventNoteTypeId) {
    this.setState({eventNoteTypeId});
  }

  onRestrictedToggled(e) {
    const {isRestricted} = this.state;
    this.setState({isRestricted: !isRestricted});
  }

  onClickCancel(event) {
    this.props.onCancel();
  }

  onClickSave(event) {
    const {onSave, showRestrictedCheckbox} = this.props;
    const {isRestricted, text, eventNoteTypeId} = this.state;

    const params = {
      eventNoteTypeId,
      text,
      ...(showRestrictedCheckbox ? {isRestricted} : {}),
      ...this.eventNoteUrlsForSave()
    };

    onSave(params);
  }

  render() {
    const {
      style,
      requestState,
      currentEducator,
      showRestrictedCheckbox
    } = this.props;
    const {text} = this.state;

    return (
      <div className="DraftNote" style={{...styles.dialog, ...style}}>
        {this.renderNoteHeader(currentEducator.email)}
        <textarea
          className="DraftNote-textarea"
          rows={10}
          style={styles.textarea}
          ref={ref => this.textareaRef = ref}
          value={text}
          onChange={this.onChangeText} />
        {showRestrictedCheckbox &&
          <div>
            <div style={{ marginBottom: 5, marginTop: 20 }}>
              Restrict access?
            </div>
            <label style={{ marginLeft: 10, color: 'black', cursor: 'pointer' }}>
              <input type="checkbox" onClick={this.onRestrictedToggled} />
              <span style={{paddingLeft: 5}}>Yes, note contains private or sensitive personal information</span>
            </label>
          </div>
        }
        <div style={{ marginBottom: 5, marginTop: 20 }}>
          What are these notes from?
        </div>
        {this.renderNoteButtonsPerDistrict()}
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
          style={styles.cancelDraftNoteButton}
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

  renderNoteHeader(educatorEmail) {
    const {nowFn} = this.context;
    return (
      <div>
        <span style={styles.date}>
          {nowFn().format('MMMM D, YYYY')}
        </span>
        |
        <span style={styles.educator}>
          {educatorEmail}
        </span>
      </div>
    );
  }

  renderNoteButtonsPerDistrict() {
    const {districtKey} = this.context;
    const {leftEventNoteTypeIds, rightEventNoteTypeIds} = takeNotesChoices(districtKey);
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          {leftEventNoteTypeIds.map(this.renderNoteButton, this)}
        </div>
        <div style={{ flex: 1 }}>
          {rightEventNoteTypeIds.map(this.renderNoteButton, this)}
        </div>
      </div>
    );
  }

  renderNoteButton(eventNoteTypeId) {
    return (
      <button
        key={eventNoteTypeId}
        className="btn note-type"
        onClick={this.onClickNoteType.bind(this, eventNoteTypeId)}
        tabIndex={-1}
        name={eventNoteTypeId}
        style={{
          ...styles.serviceButton,
          background: '#eee',
          outline: 0,
          border: (eventNoteTypeId === this.state.eventNoteTypeId)
            ? '4px solid rgba(49, 119, 201, 0.75)'
            : '4px solid white'
        }}>
        {eventNoteTypeText(eventNoteTypeId)}
      </button>
    );
  }

  renderAttachmentLinkArea() {
    const {noteInProgressAttachmentUrls} = this.state;
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
    return (
      <div key={index}>
        <input
          className="DraftNote-attachment-link-input"
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
}
DraftNote.contextTypes = {
  districtKey: PropTypes.string.isRequired,
  nowFn: PropTypes.func.isRequired
};
DraftNote.propTypes = {
  style: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  currentEducator: PropTypes.object.isRequired,
  requestState: PropTypes.string, // or null
  showRestrictedCheckbox: PropTypes.bool
};
DraftNote.defaultProps = {
  showRestrictedCheckbox: false
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
  cancelDraftNoteButton: { // overidding CSS
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
