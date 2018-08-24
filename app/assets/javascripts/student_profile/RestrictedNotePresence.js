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

    this.fetchRestrictedContent = this.fetchRestrictedContent.bind(this);
    this.onViewClicked = this.onViewClicked.bind(this);
    this.renderRestrictedContent = this.renderRestrictedContent.bind(this);
  }

  fetchRestrictedContent() {
    const {eventNoteId} = this.props;
    return apiFetchJson(`/api/event_notes/${eventNoteId}/restricted_note_json`);
  }

  onViewClicked(e) {
    e.preventDefault();
    this.setState({isViewing: true});
  }

  render() {
    const {isViewing, allowViewing} = this.state;
    return (
      <div className="RestrictedNotePresence">
        {isViewing && !allowViewing
          ? this.renderViewing()
          : this.renderRedaction()}
      </div>
    );
  }

  renderRedaction() {
    const {studentFirstName, educatorName, allowViewing} = this.props;
    const studentFirstNameOrTheir = (studentFirstName)
      ? `${studentFirstName}'s`
      : 'their';

    return (
      <div>
        <NoteText
          style={styles.restrictedNoteRedaction}
          text={`To respect ${studentFirstNameOrTheir} privacy, ${educatorName || 'the author'} marked this note as restricted.`}
        />
        {allowViewing && 
          <a
            href="#"
            style={styles.showLink}
            onClick={this.onViewClicked}>show restricted note</a>
        }
      </div>
    );
  }

  renderViewing() {
    return (
      <GenericLoader
        promiseFn={this.fetchRestrictedContent}
        render={this.renderRestrictedContent}
      />
    );
  }

  renderRestrictedContent(json) {
    const {text} = json;
    return (
      <div>
        <NoteText text={text} />
        <div style={styles.restrictedNoteLabel}>This is a restricted note.</div>
      </div>
    );
  }
}
RestrictedNotePresence.propTypes = {
  eventNoteId: PropTypes.number.isRequired,
  studentFirstName: PropTypes.string,
  educatorName: PropTypes.string,
  allowViewing: PropTypes.bool
};
RestrictedNotePresence.defaultProps = {
  allowViewing: false
};

const styles = {
  restrictedNoteRedaction: {
    color: '#999'
  },
  showLink: {
    display: 'inline-block',
    color: '#999',
    cursor: 'pointer',
    paddingTop: 5
  },
  restrictedNoteLabel: {
    color: 'red',
    fontWeight: 'bold',
    paddingTop: 5
  }
};