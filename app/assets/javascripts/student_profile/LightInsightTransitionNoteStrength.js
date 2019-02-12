import React from 'react';
import PropTypes from 'prop-types';
import {toMomentFromRailsDate, toMomentFromTimestamp} from '../helpers/toMoment';
import HelpBubble, {modalFromRight} from '../components/HelpBubble';
import Educator from '../components/Educator';
import NoteCard from './NoteCard';
import {badgeStyle} from './NotesList';
import LightInsightQuote, {fontSizeStyle} from './LightInsightQuote';
import {parseAndReRender} from './transitionNoteParser';


// Render an insight about a strength from a transition note
export default class LightInsightTransitionNoteStrength extends React.Component {
  render() {
    const {insightPayload} = this.props;
    const strengthsQuoteText = insightPayload.strengths_quote_text;
    const transitionNote = insightPayload.transition_note;
    const {educator} = transitionNote;
    const dateText = toMomentFromTimestamp(transitionNote.created_at).format('M/D/YY');

    return (
      <LightInsightQuote
        className="LightInsightTransitionNoteStrength"
        quoteEl={`“${strengthsQuoteText}”`}
        sourceEl={
          <div>
            <div>from <Educator style={fontSizeStyle} educator={educator} /></div>
            <div>
              <span>in </span>
              <HelpBubble
                style={{margin: 0}}
                modalStyle={modalFromRight}
                linkStyle={fontSizeStyle}
                teaser="Transition note"
                title="Transition note"
                content={this.renderTransitionNoteDialog(transitionNote, educator)}
              />
              <span> on {dateText}</span>
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
    strengths_quote_text: PropTypes.string.isRequired,
    transition_note: PropTypes.shape({
      text: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      educator: PropTypes.shape({
        id: PropTypes.number.isRequired,
        full_name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired
      }).isRequired
    }).isRequired
  })
};


export const TRANSITION_NOTE_STRENGTH_INSIGHT_TYPE = 'transition_note_strength';
