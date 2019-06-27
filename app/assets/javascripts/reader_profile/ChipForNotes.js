import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import lunr from 'lunr';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import Timestamp from '../components/Timestamp';
import NoteBadge from '../components/NoteBadge';
import NoteText from '../components/NoteText';
import {FakeTooltip} from './Tooltip';
import {Highlight} from './TextSearchForReading';
import Freshness from './Freshness';
import {noteChipHeaderStyle, noteChipStyle} from './containers';
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

    // sort by date, not relevance
    const sortedMatches = _.sortBy(notesMatches, noteMatch => -1 * toMomentFromTimestamp(noteMatch.note.recorded_at).unix());

    return (
      <Freshness className="ChipForNotes" daysAgo={daysAgo}>
        <div style={{height: '100%'}}>
          {sortedMatches.map((noteMatch, index) => (
            <FakeTooltip
              key={index}
              tooltipStyle={{left: '20%', top: '20%'}}
              title={<NoteText text={noteMatch.note.text} style={{fontSize: 12}} />}
            >
              <div key={index} style={noteChipStyle}>
                <div>
                  <NoteBadge style={noteChipHeaderStyle} eventNoteTypeId={noteMatch.note.event_note_type_id} />
                  <Timestamp style={{display: 'inline', marginLeft: 5}} railsTimestamp={noteMatch.note.recorded_at} />
                </div>
                <div style={{maxHeight: '100%', overflowY: 'scroll'}}>
                  {noteMatch.positions.map(position => (
                    <span key={position[0]} style={{marginRight: 5}}>
                      <Highlight
                        text={noteMatch.note.text}
                        start={position[0]}
                        length={position[1]}
                      />
                    </span>
                  ))}
                </div>
              </div>
            </FakeTooltip>
          ))}
        </div>
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
  