import React from 'react';
import PropTypes from 'prop-types';
import Educator from '../components/Educator';


// The shell with no substance, leaving that to callers.
// Used by profile and my notes
export function NoteCardShell(props) {
  const {whenEl, badgeEl, educatorEl, substanceEl, attachmentsEl} = props;
  return (
    <div className="NoteCard" style={styles.note}>
      <div style={styles.titleLine}>
        <span className="date" style={styles.date}>
          {whenEl}
        </span>
        <span style={styles.badge}>{badgeEl}</span>
        {educatorEl}
      </div>
      {substanceEl}
      {attachmentsEl}
    </div>
  );
}
NoteCardShell.propTypes = {
  whenEl: PropTypes.node.isRequired,
  badgeEl: PropTypes.node.isRequired,
  educatorEl: PropTypes.node.isRequired,
  substanceEl: PropTypes.node.isRequired,
  attachmentsEl: PropTypes.node
};

export function EducatorCard({educator}) {
  if (!educator) return null;
  return (
    <span style={styles.educator}>
      <Educator educator={educator} />
    </span>
  );
}
EducatorCard.propTypes = {
  educator: PropTypes.object.isRequired
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
  }
};
