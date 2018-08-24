import React from 'react';
import PropTypes from 'prop-types';
import NoteText from '../components/NoteText';


// Renders the presence of a restricted note, and with a click or action,
// allows viewing or editing.
export default class RestrictedNotePresence extends React.Component {
  render() {
    const {studentFirstName, educatorName} = this.props;
    const studentFirstNameOrTheir = (studentFirstName)
      ? `${studentFirstName}'s`
      : 'their';

    return (
      <div className="RestrictedNotePresence">
        <NoteText
          style={styles.restrictedNoteRedaction}
          text={`To respect ${studentFirstNameOrTheir} privacy, ${educatorName || 'the author'} marked this note as restricted.  Consider whether you really need to know before asking more.`}
        />
      </div>
    );
  }
}
RestrictedNotePresence.propTypes = {
  eventNoteId: PropTypes.number.isRequired,
  studentFirstName: PropTypes.string,
  educatorName: PropTypes.string,
  allowViewing: PropTypes.bool,
  allowEditing: PropTypes.bool
};

const styles = {
  restrictedNoteRedaction: {
    color: '#999'
  }
};