import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {takeNotesChoices} from '../helpers/PerDistrict';
import {eventNoteTypeText} from '../helpers/eventNoteType';
import {
  apiPatchJson,
  apiPostJson
} from '../helpers/apiFetchJson';
import {formatEducatorName} from '../helpers/educatorName';
import Educator from '../components/Educator';
import HouseBadge from '../components/HouseBadge';
import NoteBadge from '../components/NoteBadge';
import Badge from '../components/Badge';
import Timestamp from '../components/Timestamp';
import FeedCardFrame from '../feed/FeedCardFrame';
// import Autosaver from '../reading/Autosaver';
import RestrictedNotePresence, {urlForRestrictedEventNoteContent} from './RestrictedNotePresence';

// Render a card in the feed for an EventNote
/*
ux
X how to transition to this from static note
  transition from "adding" to "normal, static and I'm editing it"
    navigation away and back
  readonly / editable
  showing contents of restricted
  last edited timestamp
  showing saving error (eg, signed out)
  timestamp, updated at

server
  serialization to profile (eg, student)
  endpoints allowing patching/restricted
  allow text to be blank on server

ui eng
  note allowing multiple POST calls (isPendingCreateRequest)
  tighten throttling / last synced
  infinite retries on failure
*/
export default class TakeNotesTakeTwo extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      anyPendingRequests: false,
      syncError: null,
      syncedNote: props.defaultNote,
      note: props.defaultNote || {
        studentId: props.student.id,
        recordedAtTimestamp: context.nowFn(),
        id: null,
        isRestricted: false,
        text: '',
        eventNoteTypeId: null
      }
    };

    this.isPendingCreateRequest = false; // improve
    this.sync = _.throttle(this.sync.bind(this), 1000);
    this.onClickNoteType = this.onClickNoteType.bind(this);
    this.onToggleRestricted = this.onToggleRestricted.bind(this);
    this.onTextChanged = this.onTextChanged.bind(this);
    this.onSynced = this.onSynced.bind(this);
    this.onSyncError = this.onSyncError.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!_.isEqual(this.state.syncedNote, this.state.note)) {
      this.sync(this.state.note);
    }
  }

  sync(note) {
    if (!note.text) return; // need to update server

    if (!note.id && !this.isPendingCreateRequest) {
      this.isPendingCreateRequest = true;
      return apiPostJson('/api/event_notes', {
        event_note: {
          event_note_type_id: note.eventNoteTypeId,
          text: note.text,
          student_id: note.studentId,
          is_restricted: note.isRestricted,
          event_note_attachments_attributes: []
        }
      }).then(this.onSynced.bind(this, note)).catch(this.onSyncError);
    } else {
      return apiPatchJson(`/api/event_notes/${note.id}`, {
        event_note: {
          event_note_type_id: note.eventNoteTypeId,
          text: note.text,
          is_restricted: note.isRestricted
        }
      }).then(this.onSynced.bind(this, note)).catch(this.onSyncError);
    }
  }

  noteFromDiff(diff) {
    const {note} = this.state;
    return {...note, ...diff};
  }
  
  onSynced(syncedNote, json) {
    const {note} = this.state;
    if (!note.id && json.id) {
      const updatedNote = this.noteFromDiff({id: json.id});
      this.setState({
        syncedNote: syncedNote,
        note: updatedNote
      });
    } else {
      this.setState({syncedNote});
    }
  }

  onSyncError(err) {
    this.setState({syncError: err});
  }

  onClickNoteType(eventNoteTypeId) {
    const note = this.noteFromDiff({eventNoteTypeId});
    this.setState({note});
  }

  onTextChanged(e) {
    const note = this.noteFromDiff({text: e.target.value});
    this.setState({note});
  }

  onToggleRestricted(options, e) {
    e.preventDefault();

    const {student} = this.props;
    const {isRestricted} = this.state.note;
    const msg = isRestricted
      ? `This will allow all educators who work with ${student.first_name} to read this note.\n\nOpen access to this note?`
      : `Marking this note as restricted will protect ${student.first_name}'s privacy,\nwhile also limiting which educators can access this information.\n\nRestrict access to this note?`;

    // Optionall skip asking for confirmation
    if (!options.skipConfirmation) {
      if (!confirm(msg)) return;
    }

    const note = this.noteFromDiff({isRestricted: !isRestricted});
    this.setState({note});
  }

  render() {
    const {recordedAtTimestamp, eventNoteTypeId} = this.state.note;
    const {educator, student, style} = this.props;

    return (
      <div className="TakeNotesTakeTwo" style={style}>
        <FeedCardFrame
          style={styles.frame}
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
          // whenEl={<Timestamp railsTimestamp={recordedAtTimestamp} />}
          whereEl={null}
          whenEl={recordedAtTimestamp.format('M/D/Y h:mma')}
          badgesEl={this.renderBadges(student, eventNoteTypeId)}
          iconsEl={this.renderIcons()}
        >
          {this.renderNoteSubstanceOrRedaction()}
        </FeedCardFrame>
      </div>
    );
  }

  // For restricted notes, show a message and allow switching to another
  // component that allows viewing and editing.
  // Otherwise, show the substance of the note.
  renderNoteSubstanceOrRedaction() {
    const {note} = this.state;
    const {showRestrictedNoteWithoutRedaction} = this.props;
    return (!note.id || !note.isRestricted || showRestrictedNoteWithoutRedaction)
      ? this.renderContent()
      : this.renderRestrictedNoteRedaction();
  }

  renderRestrictedNoteRedaction() {
    const {student, educator} = this.props;
    const {note} = this.state;
    const educatorName = formatEducatorName(educator);
    const educatorFirstNameOrEmail = educatorName.indexOf(' ') !== -1
      ? educatorName.split(' ')[0]
      : educatorName;
    
    return (
      <RestrictedNotePresence
        studentFirstName={student.first_name}
        educatorName={educatorFirstNameOrEmail}
        urlForRestrictedNoteContent={urlForRestrictedEventNoteContent({id: note.id})}
      />
    );
  }

  renderContent() {
    const {text, eventNoteTypeId} = this.state.note;
    if (!eventNoteTypeId) return this.renderNoteButtonsPerDistrict();

    return (
      <div>
        <textarea
          autoFocus={true}
          style={styles.text}
          onChange={this.onTextChanged}
          value={text}
        />
        {this.renderNoteMessage()}
      </div>
    );
  }

  renderNoteMessage() {
    const {text, isRestricted} = this.state.note;
    if (!isRestricted && text.indexOf('51a') !== -1) {
      return (
        <div style={{...styles.messageBelowText, ...styles.warning}}>
          <span>"51a" may be private or sensitive</span>
          <a href="#" style={styles.markRestrictedLink} onClick={this.onToggleRestricted.bind(this, {skipConfirmation: true})}>Mark note restricted?</a>
        </div>
      );
    }

    // placeholder to keep sizing
    return <div style={styles.messageBelowText} />;
  }

  renderBadges(student, eventNoteTypeId) {
    const {note} = this.state;
          
    // can only see badges after picking type
    if (!note.eventNoteTypeId) return;

    return (
      <div>
        {note.isRestricted
          ? <Badge backgroundColor="lightslategray" text={<span>🔒 Restricted</span>} />
          : <span
              style={{verticalAlign: 'middle', cursor: 'pointer'}}
              onClick={this.onToggleRestricted.bind(this, {})}>
              <Badge backgroundColor="#f8f8f8" text="Unrestricted" style={{opacity: 1, color: 'lightslategray'}}/>
            </span>
        }
        {student.house && <HouseBadge style={styles.footerBadge} house={student.house} />}
        {eventNoteTypeId && <NoteBadge style={styles.footerBadge} eventNoteTypeId={eventNoteTypeId} />}
      </div>
    );
  }

  renderIcons() {
    return (
      <div>
        {this.renderSavingIcons()}
      </div>
    );
  }

  renderSavingIcons() {
    const {syncError, syncedNote, note} = this.state;
    if (syncError) {
      return <span style={{color: 'darkorange'}}>⚠️ Could not save.</span>;
    } else if (!note.id) {
      return null;
    } else if (_.isEqual(syncedNote, note)) {
      <span style={{color: '#ccc'}}>Saved.</span>;
    } else {
      return <span style={{color: '#999'}}>Saving...</span>;
    }
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
  defaultNote: PropTypes.object,
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
  style: PropTypes.object,
  showRestrictedNoteWithoutRedaction: PropTypes.bool
};


const styles = {
  footerBadge: {
    marginLeft: 5
  },
  person: {
    fontWeight: 'bold'
  },
  frame: {
  },
  buttons: {
    display: 'flex',
    minHeight: 200
  },
  messageBelowText: {
    display: 'flex',
    height: '2em',
    alignItems: 'center',
    marginTop: 5
  },
  warning: {
    color: 'darkorange'
  },
  markRestrictedLink: {
    fontWeight: 'bold',
    display: 'inline-block',
    marginLeft: 10,
    textDecoration: 'underline'
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
    fontSize: 14,
    resize: 'none',
    border: '1px solid white',
    padding: 0,
    borderRadius: 3
  }
};

