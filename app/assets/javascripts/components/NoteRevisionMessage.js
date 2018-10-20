import React from 'react';
import PropTypes from 'prop-types';

// Show how many times a note has been revised
export default function NoteRevisionMessage({numberOfRevisions}) {
  if (numberOfRevisions === undefined) return null;
  return (
    <div style={styles.revisionsText}>
      {(numberOfRevisions === 1)
          ? 'Revised 1 time'
          : 'Revised ' + numberOfRevisions + ' times'}
    </div>
  );
}
NoteRevisionMessage.propTypes = {
  numberOfRevisions: PropTypes.number.isRequired
};


const styles = {
  revisionsText: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 13
  }
};
