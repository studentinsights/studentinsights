import React from 'react';
import PropTypes from 'prop-types';
import {apiFetchJson} from '../helpers/apiFetchJson';
import NoteText from '../components/NoteText';
import GenericLoader from '../components/GenericLoader';


// Renders the presence of a restricted note, and with a click or action,
// allows viewing or editing.
export default class RestrictedNotePresence extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isViewing: false
    };

    this.onViewClicked = this.onViewClicked.bind(this);
    this.renderRestrictedText = this.renderRestrictedText.bind(this);
  }

  onViewClicked(e) {
    e.preventDefault();
    this.setState({isViewing: true});
  }

  render() {
    const {isViewing, fetchRestrictedText} = this.state;
    return (
      <div className="RestrictedNotePresence">
        {isViewing && !fetchRestrictedText
          ? this.renderViewing()
          : this.renderRedaction()}
      </div>
    );
  }

  renderRedaction() {
    const {studentFirstName, educatorName, fetchRestrictedText} = this.props;
    const educatorNameOrAdministrator = (educatorName)
      ? `${educatorName} or an administrator`
      : 'an administrator';
    const studentFirstNameOrTheir = (studentFirstName)
      ? `${studentFirstName}'s`
      : 'their';

    return (
      <div>
        <NoteText
          style={styles.restrictedNoteRedaction}
          text={`To respect ${studentFirstNameOrTheir} privacy, ${educatorNameOrAdministrator} marked this note as restricted.`}
        />
        {fetchRestrictedText && 
          <a
            href="#"
            style={styles.showLink}
            onClick={this.onViewClicked}>show restricted note</a>
        }
      </div>
    );
  }

  renderViewing() {
    const {fetchRestrictedText} = this.props;
    return (
      <GenericLoader
        promiseFn={fetchRestrictedText}
        render={this.renderRestrictedText}
      />
    );
  }

  renderRestrictedText(restrictedText) {
    return (
      <div>
        <NoteText text={restrictedText} />
        <div style={styles.restrictedNoteLabel}>This is a restricted note.</div>
      </div>
    );
  }
}
RestrictedNotePresence.propTypes = {
  studentFirstName: PropTypes.string,
  educatorName: PropTypes.string,
  fetchRestrictedText: PropTypes.func
};

const styles = {
  restrictedNoteRedaction: {
    color: '#999'
  },
  showLink: {
    display: 'inline-block',
    color: '#999',
    fontSize: 12,
    paddingTop: 5,
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  restrictedNoteLabel: {
    color: 'red',
    fontWeight: 'bold',
    paddingTop: 5
  }
};

export function fetchRestrictedTransitionNoteText(transitionNote) {
  const url = `/api/students/${transitionNote.student_id}/restricted_transition_note_json`;
  return apiFetchJson(url).then(json => json.text);
}

export function fetchRestrictedNoteText(eventNote) {
  const url = `/api/event_notes/${eventNote.id}/restricted_note_json`;
  return apiFetchJson(url).then(json => json.text);
}