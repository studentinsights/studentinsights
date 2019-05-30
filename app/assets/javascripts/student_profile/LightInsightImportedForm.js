import React from 'react';
import PropTypes from 'prop-types';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import HelpBubble, {modalFromRightWithVerticalScroll} from '../components/HelpBubble';
import NoteText from '../components/NoteText';
import InsightFromStudent from './InsightFromStudent';
import {fontSizeStyle} from './LightInsightQuote';



// Render an insight from a student voice survey response
export default class LightInsightImportedForm extends React.Component {
  render() {
    const {student, insightPayload} = this.props;
    const promptText = insightPayload.prompt_text;
    const responseText = insightPayload.response_text;
    const flattenedForm = insightPayload.flattened_form_json;
    const surveyMoment = toMomentFromTimestamp(flattenedForm.form_timestamp);

    return (
      <InsightFromStudent
        promptText={promptText}
        responseText={responseText}
        student={student}
        inWhatWhenEl={
          <div>
            <span>in </span>
            <HelpBubble
              style={{margin: 0}}
              modalStyle={modalFromRightWithVerticalScroll}
              linkStyle={fontSizeStyle}
              teaser={flattenedForm.form_title}
              title={flattenedForm.form_title}
              content={this.renderDialog(flattenedForm)}
            />
            <span> on {surveyMoment.format('M/D/YY')}</span>
          </div>
        }
      />
    );
  }
  
  renderDialog(flattenedForm) {
    return (
      <div style={{display: 'flex', flexDirection: 'column', overflowY: 'scroll'}}>
        <NoteText text={flattenedForm.text} />
      </div>
    );
  }
}
LightInsightImportedForm.propTypes = {
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired
  }).isRequired,
  insightPayload: PropTypes.shape({
    prompt_text: PropTypes.string.isRequired,
    response_text: PropTypes.string.isRequired,
    flattened_form_json: PropTypes.shape({
      form_title: PropTypes.string.isRequired,
      form_timestamp: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired
    }).isRequired
  })
};


export const IMPORTED_FORM_INSIGHT_TYPE = 'imported_form_insight';
