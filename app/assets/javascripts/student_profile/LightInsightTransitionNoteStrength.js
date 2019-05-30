import React from 'react';
import PropTypes from 'prop-types';
import {toMomentFromRailsDate, toMomentFromTimestamp} from '../helpers/toMoment';
import HelpBubble, {modalFromRight} from '../components/HelpBubble';
import Educator from '../components/Educator';
import NoteShell from '../components/NoteShell';
import NoteText from '../components/NoteText';
import {fontSizeStyle} from './LightInsightQuote';
import InsightFromEducator from './InsightFromEducator';
import {parseAndReRender} from './transitionNoteParser';


// Render an insight about a strength from a transition note
export default class LightInsightTransitionNoteStrength extends React.Component {
  render() {
    const {student, insightPayload} = this.props;
    const promptText = `What are ${student.first_name}'s strengths?`;
    const responseText = insightPayload.strengths_quote_text;
    const transitionNote = insightPayload.transition_note;
    const {educator} = transitionNote;
    const dateText = toMomentFromTimestamp(transitionNote.recorded_at).format('M/D/YY');

    return (
      <InsightFromEducator
        promptText={promptText}
        responseText={responseText}
        educator={educator}
        inWhatWhenEl={
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
        }
      />
    );
  }
  
  // Look similar to profile view
  renderTransitionNoteDialog(transitionNote, educator) {
    const text = parseAndReRender(transitionNote.text);
    return (
      <NoteShell
        whenEl={toMomentFromRailsDate(transitionNote.recorded_at).format('MMMM D, YYYY')}
        badgeEl="Transition note"
        educatorEl={<Educator educator={educator} />}
        substanceEl={<NoteText text={text} />}
      />
    );
  }
}
LightInsightTransitionNoteStrength.propTypes = {
  student: PropTypes.shape({
    first_name: PropTypes.string.isRequired
  }).isRequired,
  insightPayload: PropTypes.shape({
    strengths_quote_text: PropTypes.string.isRequired,
    transition_note: PropTypes.shape({
      text: PropTypes.string.isRequired,
      recorded_at: PropTypes.string.isRequired,
      educator: PropTypes.shape({
        id: PropTypes.number.isRequired,
        full_name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired
      }).isRequired
    }).isRequired
  })
};


export const TRANSITION_NOTE_STRENGTH_INSIGHT_TYPE = 'transition_note_strength';
