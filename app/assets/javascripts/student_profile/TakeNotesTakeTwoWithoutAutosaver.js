import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {takeNotesChoices} from '../helpers/PerDistrict';
import {eventNoteTypeText} from '../helpers/eventNoteType';
import {
  apiPatchJson,
  apiPostJson
} from '../helpers/apiFetchJson';
import Educator from '../components/Educator';
import HouseBadge from '../components/HouseBadge';
import NoteBadge from '../components/NoteBadge';
import Timestamp from '../components/Timestamp';
import FeedCardFrame from '../feed/FeedCardFrame';
import Autosaver from '../reading/Autosaver';

// Render a card in the feed for an EventNote
// last synced?
// throttling?
// showing errors?
// grabbing id?
// allow text to be blank on server
export default class TakeNotesTakeTwo extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      note: {
        studentId: props.student.id,
        updatedAtTimestamp: context.nowFn(),
        id: null,
        isRestricted: false,
        text: '',
        eventNoteTypeId: null
      }
    };

    this.sync = _.throttle(this.sync.bind(this), 500);
    this.onClickNoteType = this.onClickNoteType.bind(this);
    this.onTextChanged = this.onTextChanged.bind(this);
    this.onSynced = this.onSynced.bind(this);
    this.onSyncError = this.onSyncError.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    this.sync(this.state.note);
  }

  sync(note) {
    console.log('sync', note);
    if (!note.id) {
      return apiPostJson('/api/event_notes', {
        event_note: {
          event_note_type_id: note.eventNoteTypeId,
          text: note.text,
          student_id: note.studentId,
          is_restricted: note.isRestricted,
          event_note_attachments_attributes: []
        }
      }).then(this.onSynced).catch(this.onSyncError);
    } else {
      return apiPatchJson(`/api/event_notes/${note.id}`, {
        event_note: {
          event_note_type_id: note.eventNoteTypeId,
          text: note.text,
          is_restricted: note.isRestricted
        }
      }).then(this.onSynced).catch(this.onSyncError);
    }
  }

  setStateForNote(noteDiff) {
    const {note} = this.state;
    const updatedNote = {...note, ...noteDiff};
    this.setState({note: updatedNote});
  }
  
  onSynced(json) {
    console.log('onSynced', json);
    const {note} = this.state;
    if (!note.id && json.id) this.setStateForNote({id: json.id});
  }

  onSyncError(err) {
    console.log('onSyncError', err);
  }

  onClickNoteType(eventNoteTypeId) {
    this.setStateForNote({eventNoteTypeId});
  }

  onTextChanged(e) {
    this.setStateForNote({text: e.target.value});
  }

  render() {
    const {updatedAtTimestamp, eventNoteTypeId} = this.state.note;
    const {educator, student, style} = this.props;

    return (
      <div className="TakeNotesTakeTwo">
        <FeedCardFrame
          style={{...styles.frame, ...style}}
          student={student}
          byEl={
            <div>
              <span>by </span>
              <Educator
                style={styles.person}
                educator={educator} />
            </div>
          }
          // whereEl={<div>in {eventNoteTypeText(eventNoteTypeId)}</div>}
          // whenEl={<Timestamp railsTimestamp={updatedAtTimestamp} />}
          whereEl={null}
          whenEl={updatedAtTimestamp.format('m/d/Y h:mma')}
          badgesEl={<div>
            {student.house && <HouseBadge style={styles.footerBadge} house={student.house} />}
            {eventNoteTypeId && <NoteBadge style={styles.footerBadge} eventNoteTypeId={eventNoteTypeId} />}
          </div>}
          iconsEl={<span style={{color: '#ccc'}}>⚠️</span>}
        >
          {this.renderContent()}
        </FeedCardFrame>
      </div>
    );
  }

  renderContent() {
    const {text, eventNoteTypeId} = this.state.note;
    if (!eventNoteTypeId) return this.renderNoteButtonsPerDistrict();

    return (
      <textarea
        autoFocus={true}
        style={styles.text}
        onChange={this.onTextChanged}
        value={text}
      />
    );
  }

  renderNoteButtonsPerDistrict() {
    const {districtKey} = this.context;
    const {leftEventNoteTypeIds, rightEventNoteTypeIds} = takeNotesChoices(districtKey);
    return (
      <div style={styles.buttons}>
        <div style={{ flex: 1 }}>
          {leftEventNoteTypeIds.map(this.renderNoteButton, this)}
        </div>
        <div style={{ flex: 1 }}>
          {rightEventNoteTypeIds.map(this.renderNoteButton, this)}
        </div>
      </div>
    );
  }

  // TODO(kr) extract button UI
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
          outline: 0
        }}>
        {eventNoteTypeText(eventNoteTypeId)}
      </button>
    );
  }
}

TakeNotesTakeTwo.contextTypes = {
  districtKey: PropTypes.string.isRequired,
  nowFn: PropTypes.func.isRequired
};
TakeNotesTakeTwo.propTypes = {
  educator: PropTypes.object.isRequired,
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    grade: PropTypes.string.isRequired,
    house: PropTypes.string,
    school: PropTypes.shape({
      local_id: PropTypes.string.isRequired,
      school_type: PropTypes.string.isRequired
    }),
    homeroom: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      educator: PropTypes.object
    })
  }).isRequired,
  style: PropTypes.object
};


const styles = {
  footerBadge: {
    marginLeft: 5
  },
  person: {
    fontWeight: 'bold'
  },
  frame: {
    minHeight: 300
  },
  buttons: {
    display: 'flex',
    minHeight: 200
  },
  serviceButton: {
    color: 'black',
    minWidth: '14em',
    fontSize: 12,
    marginRight: '1em',
    padding: 8,
    marginTop: 5
  },
  text: {
    width: '100%',
    border: '1px solid #eee',
    padding: 5,
    borderRadius: 3,
    minHeight: 200
  }
};


export class TakeNoteTakeTwoAutosaver extends React.Component {
  doSave() {
    
  }

  readSnapshotForSaving() {

  }

  render() {
    return (
      <Autosaver
        readSnapshotFn={this.readSnapshotForSaving}
        doSaveFn={this.doSave}
        autoSaveIntervalMs={2000}
      />
    );
  }
}