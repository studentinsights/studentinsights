import PropTypes from 'prop-types';
import React from 'react';
import {takeNotesChoices} from '../helpers/PerDistrict';
import {eventNoteTypeText} from '../helpers/eventNoteType';
import {apiPostJson} from '../helpers/apiFetchJson';
import Educator from '../components/Educator';
import UnhandledErrorMessage from '../components/UnhandledErrorMessage';
import FeedCardFrame from '../feed/FeedCardFrame';
import EditableNote from './EditableNote';

// For creating the initial note, and then rendering the editable UI.
export default class TakeNotesTakeTwo extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      eventNoteTypeId: null,
      postError: null,
      noteJson: null
    };

    this.onClickNoteType = this.onClickNoteType.bind(this);
    this.onPostDone = this.onPostDone.bind(this);
    this.onPostError = this.onPostError.bind(this);
  }

  createNote(eventNoteTypeId) {
    const {student} = this.props;

    const fetchPromise = apiPostJson('/api/event_notes', {
      event_note: {
        event_note_type_id: eventNoteTypeId,
        text: '',
        student_id: student.id,
        is_restricted: false,
        event_note_attachments_attributes: []
      }
    });

    fetchPromise
      .then(this.onPostDone)
      .catch(this.onSyncError);
  }

  onClickNoteType(eventNoteTypeId) {
    this.setState({eventNoteTypeId});
    this.createNote(eventNoteTypeId);
  }

  onPostDone(noteJson) {
    this.setState({noteJson});
  }

  onPostError(postError) {
    this.setState({postError});
  }

  render() {
    const {style} = this.props;
    return (
      <div className="TakeNotesTakeTwo" style={style}>
        {this.renderCreateOrEdit()}
      </div>
    );
  }

  renderCreateOrEdit() {
    const {nowFn} = this.context;
    const {educator, student} = this.props;
    const {eventNoteTypeId, noteJson, postError} = this.state;
    
    if (postError) {
      return <UnhandledErrorMessage>There was an error creating the note.</UnhandledErrorMessage>;
    }

    if (eventNoteTypeId && noteJson) {
      return (
        <EditableNote
          autoFocus={true}
          student={student}
          educator={educator}
          noteJson={noteJson}
        />
      );
    }

    return (
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
        whenEl={nowFn().format('M/D/Y h:mma')}
      >
        {this.renderNoteButtonsPerDistrict()}
      </FeedCardFrame>
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
