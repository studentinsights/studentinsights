import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import lunr from 'lunr';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import Freshness from './Freshness';
import SearchResultsForNotes from './SearchResultsForNotes';
import {unrollAndSortPositions} from './TextSearchForReading';


export default class ChipForNotes extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {notesMatches} = this.props;

    const mostRecentMoment = _.last(notesMatches.map(notesMatch => {
      return toMomentFromTimestamp(notesMatch.note.recorded_at);
    }).sort());
    const daysAgo = (mostRecentMoment)
      ? nowFn().clone().diff(mostRecentMoment, 'days')
      : null;

    return (
      <Freshness daysAgo={daysAgo}>
        <SearchResultsForNotes
          style={{border: '1px solid white', cursor: 'pointer'}}
          notesMatches={notesMatches} />
      </Freshness>
    );
  }
}
ChipForNotes.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
ChipForNotes.propTypes = {
  notesMatches: PropTypes.array.isRequired
};


export function buildLunrIndexForNotes(notes) {
  const documents = notes.map(note => {
    return {
      id: note.id,
      text: note.text
    };
  });
  return lunr(function() {
    this.ref('id');
    this.field('text');
    this.metadataWhitelist = ['position'];
    documents.forEach(doc => this.add(doc));
  });
}

// find notes
export function findWithinNotes(lunrIndex, notes, words) {
  const results = _.flatMap(words, word => lunrIndex.search(word));
  const resultsByRef = _.groupBy(results, r => r.ref);
  return Object.keys(resultsByRef).map(ref => {
    const eventNoteId = parseInt(ref, 10);
    const resultsForRef = resultsByRef[ref];

    const note = notes.filter(note => note.id === eventNoteId)[0]; // need a better way :)
    if (!note) return []; // shouldn't happen

    const positions = unrollAndSortPositions(resultsForRef);
    return {note, positions};

  });
}
