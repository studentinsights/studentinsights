import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import Freshness from './Freshness';
import NotesSearchForReading from './NotesSearchForReading';


export default function ChipForNotes(props) {
  const {nowMoment, matches} = props;
  const mostRecentMoment = _.last(matches.map(match => {
    return toMomentFromTimestamp(match.note.recorded_at);
  }).sort());
  const daysAgo = (mostRecentMoment)
    ? nowMoment.clone().diff(mostRecentMoment, 'days')
    : null;

  return (
    <Freshness daysAgo={daysAgo}>
      <NotesSearchForReading
        style={{border: '1px solid white', cursor: 'pointer'}}
        matches={matches} />
    </Freshness>
  );
}
ChipForNotes.propTypes = {
  nowMoment: PropTypes.object.isRequired,
  matches: PropTypes.arrayOf(PropTypes.shape({
    note: PropTypes.object.isRequired,
    positions: PropTypes.array.isRequired
  })).isRequired
};