import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

export function ChipForNotes(props) {
  const {nowMoment, matches} = props;
  const mostRecentMoment = _.last(matches.map(match => toMomentFromTimestamp(match.note.recorded_at)).sort());
  const daysAgo = mostRecentMoment ? nowMoment.clone().diff(mostRecentMoment, 'days') : null;
  return (
    <Freshness daysAgo={daysAgo}>
      <NotesSearchForReading
        style={{border: '1px solid white', cursor: 'pointer'}}
        matches={matches} />
    </Freshness>
  );
}
