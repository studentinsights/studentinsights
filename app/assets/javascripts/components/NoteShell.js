import React from 'react';
import PropTypes from 'prop-types';


// The shell with no substance, leaving that to callers.
// Used by profile and my notes
export default function NoteShell(props) {
  const {whenEl, badgeEl, educatorEl, substanceEl} = props;
  return (
    <div className="NoteCard" style={styles.note}>
      <div style={styles.titleLine}>
        <span className="date" style={styles.date}>{whenEl}</span>
        <span style={styles.badge}>{badgeEl}</span>
        <span style={styles.educator}>{educatorEl}</span>
      </div>
      <div style={styles.text}>{substanceEl}</div>
    </div>
  );
}
NoteShell.propTypes = {
  whenEl: PropTypes.node.isRequired,
  badgeEl: PropTypes.node.isRequired,
  educatorEl: PropTypes.node.isRequired,
  substanceEl: PropTypes.node.isRequired
};

const styles = {
  note: {
    border: '1px solid #eee',
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
    width: '100%'
  },
  titleLine: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  date: {
    display: 'inline-block',
    width: '11em',
    paddingRight: 10,
    fontWeight: 'bold'
  },
  badge: {
    display: 'inline-block',
    background: '#eee',
    outline: '3px solid #eee',
    width: '10em',
    textAlign: 'center',
    marginLeft: 10,
    marginRight: 10
  },
  educator: {
    paddingLeft: 5,
    display: 'inline-block'
  },
  text: {
    marginTop: 10
  }
};
