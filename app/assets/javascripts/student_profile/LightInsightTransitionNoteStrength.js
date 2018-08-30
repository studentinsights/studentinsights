import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {toMomentFromRailsDate, toMomentFromTimestamp} from '../helpers/toMoment';
import HelpBubble, {modalFromRight} from '../components/HelpBubble';
import Educator from '../components/Educator';
import NoteCard from './NoteCard';
import {badgeStyle} from './NotesList';
import LightInsightQuote, {fontSizeStyle} from './LightInsightQuote';
import {parseTransitionNoteText, parseAndReRender} from './lightTransitionNotes';


// Render an insight about a strength from a transition note
export default class LightInsightTransitionNoteStrength extends React.Component {
  render() {
    const {insightPayload, educatorsIndex} = this.props;
    const {strengthsQuoteText, transitionNote} = insightPayload;
    const dateText = toMomentFromTimestamp(transitionNote.created_at).format('M/D/YY');
    const educator = educatorsIndex[transitionNote.educator_id] || educatorsIndex[_.keys(educatorsIndex)[0]];

    return (
      <LightInsightQuote
        quoteEl={`“${strengthsQuoteText}”`}
        sourceEl={
          <div>
            <div>from <Educator style={fontSizeStyle} educator={educator} /></div>
            <div>
              <span>in</span>
              <HelpBubble
                style={{marginLeft: 5, marginRight: 5}}
                modalStyle={modalFromRight}
                linkStyle={fontSizeStyle}
                teaser="Transition note"
                title="Transition note"
                content={this.renderTransitionNoteDialog(transitionNote, educator)}
              />
              <span>on {dateText}</span>
            </div>
          </div>
        }
      />
    );
  }
  
  // Look similar to profile view
  renderTransitionNoteDialog(transitionNote, educator) {
    return (
      <NoteCard
        noteMoment={toMomentFromRailsDate(transitionNote.created_at)}
        badge={<span style={badgeStyle}>Transition note</span>}
        educatorId={educator.id}
        text={parseAndReRender(transitionNote.text)}
        educatorsIndex={{[educator.id]: educator}}
        attachments={[]} />
    );
  }
}
LightInsightTransitionNoteStrength.propTypes = {
  insightPayload: PropTypes.shape({
    strengthsQuoteText: PropTypes.string.isRequired,
    transitionNote: PropTypes.shape({
      created_at: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      educator_id: PropTypes.number.isRequired
    }).isRequired
  }),
  educatorsIndex: PropTypes.object.isRequired,
  insightStyle: PropTypes.object
};


// Only grabs strengths for now
export function insightsFromTransitionNotes(transitionNotes) {
  const safeNotes = transitionNotes.filter(transitionNote => !transitionNote.is_restricted);

  return _.flatten(safeNotes.map(transitionNote => {
    const noteParts = parseTransitionNoteText(transitionNote.text);
    const strengthsQuoteText = noteParts.strengths;
    if (!strengthsQuoteText || strengthsQuoteText.length === 0) return [];

    return [{
      insightType: 'transition_note_strength',
      insightPayload: {strengthsQuoteText, transitionNote}
    }];
  }));
}


export const TRANSITION_NOTE_STRENGTH_INSIGHT_TYPE = 'transition_note_strength';
