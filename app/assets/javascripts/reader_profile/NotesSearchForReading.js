import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import lunr from 'lunr';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import Timestamp from '../components/Timestamp';
import NoteBadge from '../components/NoteBadge';
import NoteText from '../components/NoteText';
import Tooltip from './Tooltip';


export default function NotesSearchForReading(props) {
  const {matches, style} = props;
  
  // sort by date, not relevance
  const sortedMatches = _.sortBy(matches, match => -1 * toMomentFromTimestamp(match.note.recorded_at).unix());
  return (
    <div className="NotesSearchForReading" style={{height: '100%', ...style}}>
      {sortedMatches.map((match, index) => (
         <Tooltip key={index} title={<NoteText text={match.note.text} style={{fontSize: 12}} />}>
          <div key={index} style={{textAlign: 'left', fontSize: 10, marginBottom: 20}}>
            <div>
              <NoteBadge style={{display: 'inline-block'}} eventNoteTypeId={match.note.event_note_type_id} />
              <Timestamp style={{display: 'inline', marginLeft: 5}} railsTimestamp={match.note.recorded_at} />
            </div>
            <div style={{maxHeight: '100%', overflowY: 'scroll'}}>
              {match.positions.map(position => (
                <span key={position[0]} style={{marginRight: 5}}>
                  <Highlight
                    text={match.note.text}
                    start={position[0]}
                    length={position[1]}
                  />
                </span>
              ))}
            </div>
          </div>
        </Tooltip>
      ))}
    </div>
  );
}
NotesSearchForReading.propTypes = {
  matches: PropTypes.arrayOf(PropTypes.shape({
    note: PropTypes.object.isRequired,
    positions: PropTypes.array.isRequired
  })).isRequired,
  style: PropTypes.object
};


export const SEE_AS_READER_SEARCH = [
  'books',
  'readaloud',
  'story',
  'stories',
  'motivated',
  'engage',
  'identity'
  // not 'engagement', other social, behavioral, etc?
];
export const ORAL_LANGUAGE_SEARCH = [
  '+oral +language',
  '+expressive +language',
  '+receptive +language',
  '+verbal +comprehension',
  'vocabulary',
  'listening',
  '+speech +language',
  '+speech +language +evaluation'
];
export const ENGLISH_SEARCH = [
  'WIDA',
  'ACCESS',
  'English'
];
export const SOUNDS_IN_WORDS_SEARCH = [
  'phonological',
  'phonemic',
  'phoneme',
  'PSF',
  '+phonemic +segmentation +fluency',
  'FSF',
  '+first +sound +fluency',
  'segment',
  'blend',
  'delete',
  'substitution'
];
export const SOUNDS_AND_LETTERS_SEARCH = [
  'reading',
  '+reading +intervention',
  'correspondence', // 1-1
  'letter -attendance -tardy', // not "attendance letter"
  '+letter +sounds',
  '+Lively +Letters',
  'LNF',
  '+letter +naming +fluency',
  'NWF',
  '+nonsene +word +fluency',
  'ORF',
  'DORF',
  '+oral +reading +fluency',
  'phonics',
  'decoding',
  'orthography',
  'spelling'
];


export function buildLunrIndexForNotes(notes) {
  // naively rebuild index each time
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
export function findNotes(lunrIndex, notes, words) {
  const results = _.flatMap(words, word => lunrIndex.search(word));
  const resultsByRef = _.groupBy(results, r => r.ref);
  return Object.keys(resultsByRef).map(ref => {
    const eventNoteId = parseInt(ref, 10);
    const resultsForRef = resultsByRef[ref];

    const note = notes.filter(note => note.id === eventNoteId)[0]; // need a better way :)
    if (!note) return []; // shouldn't happen

    const positions = resultsForRef.map(result => {
      return _.first(_.values(result.matchData.metadata)).text.position[0];
    });
    const uniqueSortedPositions = _.sortBy(_.uniqWith(positions, _.isEqual), position => position[0]);
    return {note, positions: uniqueSortedPositions};

  });
}


// highlighting a search result, using lunr position data
function Highlight(props) {
  const {text, start, length} = props;
  const highlight = text.slice(start, start + length);
  const beforeIndex = Math.max(start - 30, 0);
  const beforeContext = text.slice(beforeIndex, start);
  const afterIndex = Math.min(start + 30, text.length);
  const afterContext = text.slice(start + length, afterIndex);
  return (
    <span>
      ...{beforeContext}<span style={{color: 'orange'}}>{highlight}</span>{afterContext}...
    </span>
  );
}
Highlight.propTypes = {
  text: PropTypes.string.isRequired,
  start: PropTypes.number.isRequired,
  length: PropTypes.number.isRequired
};
