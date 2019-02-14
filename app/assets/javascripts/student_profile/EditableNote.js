import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {apiPatchJson, apiPutJson} from '../helpers/apiFetchJson';
import {toMomentFromRailsDate} from '../helpers/toMoment';
import {formatEducatorName} from '../helpers/educatorName';
import Educator from '../components/Educator';
import Hover from '../components/Hover';
import HouseBadge from '../components/HouseBadge';
import NoteBadge from '../components/NoteBadge';
import Badge from '../components/Badge';
import FeedCardFrame from '../feed/FeedCardFrame';
import RestrictedNotePresence, {urlForRestrictedEventNoteContent} from './RestrictedNotePresence';
import ResizingTextArea from './ResizingTextArea';


export default class EditableNote extends React.Component {
  constructor(props, context) {
    super(props, context);

    const note = {
      id: props.noteJson.id,
      studentId: props.noteJson.student_id,
      eventNoteTypeId: props.noteJson.event_note_type_id,
      recordedAtTimestamp: props.noteJson.recorded_at,
      isRestricted: props.noteJson.is_restricted,
      text: props.noteJson.text
    };
    this.state = {
      anyPendingRequests: false,
      syncError: null,
      syncedNote: note,
      note: note
    };

    this.sync = _.throttle(this.sync.bind(this), 1000);
    this.onToggleRestricted = this.onToggleRestricted.bind(this);
    this.onTextChanged = this.onTextChanged.bind(this);
    this.onSynced = this.onSynced.bind(this);
    this.onSyncError = this.onSyncError.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    const {syncError, syncedNote, note} = this.state;
    if (!_.isEqual(syncedNote, note) && !syncError) {
      return this.sync(note);
    }
  }

  sync(note) {
    const {syncedNote} = this.state;
    if (syncedNote.text !== note.text) return this.patchText(note);
    if (syncedNote.isRestricted !== note.isRestricted) this.patchIsRestricted(note);
  }

  patchIsRestricted(note) {
    return this.trackPromise(note, apiPutJson(`/api/event_notes/${note.id}/mark_as_restricted`));
  }

  patchText(note) {
    return this.trackPromise(note, apiPatchJson(`/api/event_notes/${note.id}`, {
      event_note: {
        id: note.id,
        text: note.text
      }
    }));
  }

  trackPromise(note, promise) {
    promise
      .then(this.onSynced.bind(this, note))
      .catch(this.onSyncError);
  }
  
  onSynced(syncedNote, json) {
    this.setState({syncedNote, syncError: null});
  }

  onSyncError(syncError) {
    this.setState({syncError});
  }

  onTextChanged(e) {
    const {note} = this.state;
    this.setState({
      note: {
        ...note,
        text: e.target.value
      }
    });
  }

  onToggleRestricted(options, e) {
    e.preventDefault();

    const {student} = this.props;
    const {isRestricted} = this.state.note;
    const msg = isRestricted
      ? `This will allow all educators who work with ${student.first_name} to read this note.\n\nOpen access to this note?`
      : `Marking this note as restricted will protect ${student.first_name}'s privacy,\nwhile also limiting which educators can access this information.\n\nRestrict access to this note?`;

    // Optionally skip asking for confirmation
    if (!options.skipConfirmation) {
      if (!confirm(msg)) return;
    }

    const {note} = this.state;
    this.setState({
      note: {
        ...note,
        isRestricted: !isRestricted
      }
    });
  }

  render() {
    const {recordedAtTimestamp, eventNoteTypeId} = this.state.note;
    const {educator, student, style} = this.props;

    return (
      <div className="EditableNote" style={style}>
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
          whenEl={toMomentFromRailsDate(recordedAtTimestamp).format('M/D/Y h:mma')}
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
    const {autoFocus} = this.props;
    const {text} = this.state.note;

    return (
      <div>
        <Hover>{isHovering => (
          <ResizingTextArea
            autoFocus={autoFocus}
            className="EditableNote-note-textarea"
            style={{
              ...styles.text,
              ...(isHovering ? styles.textHover : {})
            }}
            onChange={this.onTextChanged}
            value={text}
          />
        )}</Hover>
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

    return (
      <div>
        {note.isRestricted
          ? <Badge backgroundColor="lightslategray" text="🔒 Restricted" />
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
}

EditableNote.contextTypes = {
  districtKey: PropTypes.string.isRequired,
  nowFn: PropTypes.func.isRequired
};
EditableNote.propTypes = {
  noteJson: PropTypes.object.isRequired,
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
  autoFocus: PropTypes.bool,
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
    border: 0,
    outline: '1px solid white',
    padding: 0,
    borderRadius: 3
  },
  textHover: {
    outline: '1px solid #eee'
  }
};
