import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import Timestamp from '../components/Timestamp';
import NoteBadge from '../components/NoteBadge';
import NoteText from '../components/NoteText';
import Tooltip from './Tooltip';
import {Highlight} from './TextSearchForReading';


export default function SearchResultsForNotes(props) {
  const {notesMatches, style} = props;
  
  // sort by date, not relevance
  const sortedMatches = _.sortBy(notesMatches, noteMatch => -1 * toMomentFromTimestamp(noteMatch.note.recorded_at).unix());
  return (
    <div className="SearchResultsForNotes" style={{height: '100%', ...style}}>
      {sortedMatches.map((noteMatch, index) => (
         <Tooltip
          key={index}
          tooltipStyle={{left: '20%', top: '20%'}}
          title={<NoteText text={noteMatch.note.text} style={{fontSize: 12}} />}
        >
          <div key={index} style={{textAlign: 'left', fontSize: 12, marginBottom: 20}}>
            <div>
              <NoteBadge style={{display: 'inline-block', padding: 3}} eventNoteTypeId={noteMatch.note.event_note_type_id} />
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
        </Tooltip>
      ))}
    </div>
  );
}
SearchResultsForNotes.propTypes = {
  notesMatches: PropTypes.arrayOf(PropTypes.shape({
    note: PropTypes.object.isRequired,
    positions: PropTypes.array.isRequired
  })).isRequired,
  style: PropTypes.object
};