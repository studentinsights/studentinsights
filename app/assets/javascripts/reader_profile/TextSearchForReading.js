import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';


export const SEE_AS_READER_SEARCH = [
  '+reading +books',
  'readaloud',
  'story',
  'stories',
  'motivated',
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
  'prepositions',
  '+wh +questions',
  '+speech +language',
  '+speech +therapy',
  '+speech +language +evaluation',
  '+Primary +Disability +Communication'
];
export const ENGLISH_SEARCH = [
  'WIDA',
  '+ACCESS +level',
  '+English +proficiency'
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
  '+phoneme +substitution',
  '+sound +substitution'
];
export const SOUNDS_AND_LETTERS_SEARCH = [
  '+reading -books',
  '+reading +intervention',
  'correspondence', // 1-1
  'letter -attendance -tardy', // not "attendance letter"
  '-sent letter', // "sent a letter"
  '+letter +sounds',
  '+Lively +Letters',
  'LNF',
  '+letter +naming +fluency',
  'NWF',
  '+nonsense +word +fluency',
  'ORF',
  'DORF',
  '+oral +reading +fluency',
  'phonics',
  'decoding',
  'orthography',
  'spelling'
];


// highlighting a search result, using lunr position data
export function Highlight(props) {
  const {text, start, length, onlyMatches} = props;
  const highlight = text.slice(start, start + length);
  const beforeIndex = Math.max(start - 30, 0);
  const beforeContext = text.slice(beforeIndex, start);
  const afterIndex = Math.min(start + 30, text.length);
  const afterContext = text.slice(start + length, afterIndex);

  const matchEl = <span className="Highlight" style={{color: 'orange'}}>{highlight}</span>;
  if (onlyMatches) return matchEl;

  return <span className="Highlight">...{beforeContext}{matchEl}{afterContext}...</span>;
}
Highlight.propTypes = {
  text: PropTypes.string.isRequired,
  start: PropTypes.number.isRequired,
  length: PropTypes.number.isRequired,
  onlyMatches: PropTypes.bool
};


// unroll all the words matched across all the search buckets
// agnostic to the rest of the results
export function unrollAndSortPositions(searchResults) {
  const positions = _.flatMap(searchResults, result => {
    return _.flatMap(_.values(result.matchData.metadata), meta => meta.text.position);
  });
  return _.sortBy(_.uniqWith(positions, _.isEqual), position => position[0]);
}