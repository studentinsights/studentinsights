import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import lunr from 'lunr';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import Timestamp from '../components/Timestamp';
import NoteBadge from '../components/NoteBadge';

// TODO sight words?
// TODO special education evaluation?

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


export function findNotes(words, notes) {
  // naively rebuild index each time
  const documents = notes.map(note => {
    return {
      id: note.id,
      text: note.text
    };
  });
  const index = lunr(function() {
    this.ref('id');
    this.field('text');
    this.metadataWhitelist = ['position'];
    documents.forEach(doc => this.add(doc));
  });

  // search
  // window.index = index;   console.log('wat');
  // console.log(words, 'results', results);
  const results = _.flatMap(words, word => index.search(word));
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
    // console.log(eventNoteId, note.text, 'uniqueSortedPositions', uniqueSortedPositions);
    return {note, positions: uniqueSortedPositions};

  });

  // seach, each term match shown
  // const results = _.flatMap(words, word => index.search(word));
  // return _.flatMap(results, result => {
  //   const note = notes.filter(note => note.id === parseInt(result.ref, 10))[0]; // need a better way :)
  //   if (!note) {
  //     // console.log('no note for result:', results);
  //     return [];
  //   }
  //   const positions = _.first(_.values(result.matchData.metadata)).text.position;
  //   return {note, positions};
  //   // // console.log('ok', note, positions);
  //   // return positions.map(position => {
  //   //   // console.log('>> note.text', note.text);
  //   //   const highlight = createHighlight(note.text, position[0], position[1]);
  //   //   return {
  //   //     note,
  //   //     highlight
  //   //   };
  //   // });
  // });
}

export function SearchResults(props) {
  const {matches} = props;
  
  // sort by date, not relevance
  const sortedMatches = _.sortBy(matches, match => -1 * toMomentFromTimestamp(match.note.recorded_at).unix());
  return (
    <div style={{maxHeight: 120, overflowY: 'scroll'}}>
      {sortedMatches.map((match, index) => (
         <div key={index} style={{textAlign: 'left', fontSize: 10, marginBottom: 20}}>
          <div>
            <NoteBadge style={{display: 'inline-block'}} eventNoteTypeId={match.note.event_note_type_id} />
            <Timestamp style={{fontWeight: 'bold', display: 'inline', marginLeft: 5}} railsTimestamp={match.note.recorded_at} />
          </div>
          <div title={match.note.text}>{match.positions.map(position => (
            <span key={position[0]} style={{marginRight: 5}}>
              <Highlight
                text={match.note.text}
                start={position[0]}
                length={position[1]}
              />
            </span>
          ))}</div>
        </div>
      ))}
    </div>
  );
}


function Highlight(props) {
  const {text, start, length} = props;
  const highlight = text.slice(start, start + length);
  const beforeIndex = Math.max(start - 30, 0);
  const beforeContext = text.slice(beforeIndex, start);
  // console.log('beforeContext', beforeContext, beforeIndex, start);
  const afterIndex = Math.min(start + 30, text.length);
  const afterContext = text.slice(start + length, afterIndex);
  // console.log('afterContext', afterContext, start + length, afterIndex);

  // console.log('indexes:', start, length, beforeIndex, afterIndex);
  // console.log('contexts:', beforeContext, highlight, afterContext);
  // window.texts = (window.texts || []).concat(text); 
  return (
    <span>
      ...{beforeContext}<span style={{color: 'orange'}}>{highlight}</span>{afterContext}...
    </span>
  );
}