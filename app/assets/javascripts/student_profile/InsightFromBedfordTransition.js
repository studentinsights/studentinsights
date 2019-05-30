import React from 'react';
import PropTypes from 'prop-types';
import {fontSizeStyle} from './InsightQuote';
import InsightFromEducator from './InsightFromEducator';



// Render the "connecting" bit for Bedford transition notes
export default class InsightFromBedfordTransition extends React.Component {
  render() {
    const {student, insightPayload} = this.props;
    const promptText = `What helped you connect with ${student.first_name}?`;
    const responseText = insightPayload.insight_text;
    const formUrl = insightPayload.form_url;
    const educator = insightPayload.educator;

    return (
      <InsightFromEducator
        promptText={promptText}
        responseText={responseText}
        educator={educator}
        inWhatWhenEl={
          <div>
            <span>in </span>
            <a
              href={formUrl}
              style={fontSizeStyle}
              target="_blank"
              rel="noopener noreferrer">Transition spreadsheet</a>
            <span> for 2019</span>
          </div>
        }
      />
    );
  }
}
InsightFromBedfordTransition.propTypes = {
  student: PropTypes.shape({
    first_name: PropTypes.string.isRequired,
  }).isRequired,
  insightPayload: PropTypes.shape({
    insight_text: PropTypes.string.isRequired,
    form_url: PropTypes.string.isRequired,
    educator: PropTypes.shape({
      id: PropTypes.number.isRequired,
      full_name: PropTypes.string.isRequired
    }).isRequired
  })
};


export const FROM_BEDFORD_TRANSITION = 'from_bedford_transition';
