import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import uuidv4 from 'uuid/v4';
import {takeNotesChoices} from '../helpers/PerDistrict';
import {eventNoteTypeText} from '../helpers/eventNoteType';
import {PENDING, ERROR} from '../helpers/requestStates';
import Educator from '../components/Educator';
import FeedCardFrame from '../feed/FeedCardFrame';


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
      draftKey: uuidv4()
    };
    this.debouncedOnChange = _.debounce(this.debouncedOnChange, props.onChangeDebounceIntervalMs);
    this.onRestrictedToggled = this.onRestrictedToggled.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
    this.onClickSave = this.onClickSave.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
    this.onClickNoteType = this.onClickNoteType.bind(this);
  }

  // If there's an onChange prop: track all state changes, 
  // debounce them, and then call onChange as an effecct.
  componentDidUpdate(prepProps, prevState) {
    if (!this.props.onChange) return;
    if (_.isEqual(prevState, this.state)) return;

    const stateNow = {...this.state};
    this.debouncedOnChange(stateNow);
  }

  // Abort autosave if since the debouncing, actual saving has started.
  debouncedOnChange(stateThen) {
    if (this.isSavingPendingOrFailed()) return;
    this.props.onChange(stateThen);
  }

  disabledSaveButton() {
    const {text, eventNoteTypeId} = this.state;

    return (text === '' || eventNoteTypeId === null);
  }

  isSavingPendingOrFailed() {
    const {requestState} = this.props;
    return (requestState === PENDING || requestState === ERROR);
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
    const {draftKey, isRestricted, text, eventNoteTypeId} = this.state;

    const params = {
      eventNoteTypeId,
      text,
      ...(showRestrictedCheckbox ? {isRestricted} : {}),
      draftKey: draftKey,
      eventNoteAttachments: []
    };

    onSave(params);
  }

  render() {
    const {
      style,
      student,
      currentEducator
    } = this.props;

    return (
      <div className="DraftNote" style={{...styles.root, ...style}}>
        <FeedCardFrame
          style={style}
          student={student}
          byEl={
            <div>
              <span>by </span>
              <Educator
                style={styles.person}
                educator={currentEducator} />
            </div>
          }
          whenEl={'right now'}
          whereEl={null}
          badgesEl={null}
          iconsEl={null}
        >
          {this.renderContent()}
        </FeedCardFrame>
      </div>
    );
  }

  // single-step UX
  renderContent() {
    return (
      <div>
        {this.renderTypeNote()}
        {this.renderChooseEventNoteType()}
        {this.renderInteractions()}
      </div>
    );
  }

  renderChooseEventNoteType() {
    return (
      <div style={{margin: 10}}>
        <div style={{ marginBottom: 5, marginTop: 20 }}>
          What are these notes from?
        </div>
        {this.renderNoteButtonsPerDistrict()}
      </div>
    );
  }

  renderTypeNote() {
    const {showRestrictedCheckbox} = this.props;
    const {text} = this.state;
    return (
      <div>
        <textarea
          className="DraftNote-textarea"
          rows={10}
          style={styles.textarea}
          autoFocus={true}
          value={text}
          disabled={this.isSavingPendingOrFailed()}
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
      </div>
    );
  }

  renderInteractions() {
    return (
      <div style={styles.footer}>
        <div>
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
        </div>
        {this.renderIconsEl()}
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

  // always take up space
  renderIconsEl() {
    const {requestState} = this.props;
    if (requestState === PENDING) return <span style={styles.saving}>Saving...</span>;
    if (requestState === ERROR) return <span style={styles.error}>Your note is note saved.</span>;
    return <span style={styles.saving} />;
  }
}
DraftNote.contextTypes = {
  districtKey: PropTypes.string.isRequired,
  nowFn: PropTypes.func.isRequired
};
DraftNote.propTypes = {
  student: PropTypes.object.isRequired,
  currentEducator: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  onChangeDebounceIntervalMs: PropTypes.number,
  requestState: PropTypes.string, // or null
  showRestrictedCheckbox: PropTypes.bool,
  style: PropTypes.object
};
DraftNote.defaultProps = {
  showRestrictedCheckbox: false,
  onChangeDebounceIntervalMs: 500
};


const styles = {
  root: {
    marginTop: 10
  },
  textarea: {
    fontSize: 14,
    resize: 'none',
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
  },
  error: {
    fontSize: 12,
    color: 'orange',
    fontWeight: 'bold'
  },
  saving: {
    fontSize: 12,
    color: '#aaa'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 10
  }
};
