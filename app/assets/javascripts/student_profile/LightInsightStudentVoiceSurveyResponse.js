import React from 'react';
import PropTypes from 'prop-types';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import * as Routes from '../helpers/Routes';
import HelpBubble, {modalFromRight} from '../components/HelpBubble';
import NoteText from '../components/NoteText';
import LightInsightQuote, {fontSizeStyle} from './LightInsightQuote';


// Render an insight from a student voice survey response
export default class LightInsightStudentVoiceSurveyResponse extends React.Component {
  render() {
    const {student, insightPayload} = this.props;
    const promptText = insightPayload.prompt_text;
    const responseText = insightPayload.survey_response_text;
    const completedSurvey = insightPayload.student_voice_completed_survey;
    const surveyMoment = toMomentFromTimestamp(completedSurvey.form_timestamp);

    return (
      <LightInsightQuote
        className="LightInsightStudentVoiceSurveyResponse"
        quoteEl={
          <div>
            <div style={fontSizeStyle}>{promptText}</div>
            <div style={{marginTop: 5}}>“{responseText}”</div>
          </div>
        }
        sourceEl={
          <div>
            <div>from <a style={fontSizeStyle} href={Routes.studentProfile(student.id)} target="_blank">{student.first_name} {student.last_name}</a></div>
            <div>
              <span>in </span>
              <HelpBubble
                style={{margin: 0}}
                modalStyle={modalFromRight}
                linkStyle={fontSizeStyle}
                teaser="What I want my teachers to know"
                title="What I want my teachers to know"
                content={this.renderStudentSurveyDialog(completedSurvey)}
              />
              <span> on {surveyMoment.format('M/D/YY')}</span>
            </div>
          </div>
        }
      />
    );
  }
  
  renderStudentSurveyDialog(completedSurvey) {
    return <NoteText text={completedSurvey.survey_text} />;
  }
}
LightInsightStudentVoiceSurveyResponse.propTypes = {
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired
  }).isRequired,
  insightPayload: PropTypes.shape({
    prompt_key: PropTypes.string.isRequired,
    prompt_text: PropTypes.string.isRequired,
    survey_response_text: PropTypes.string.isRequired,
    student_voice_completed_survey: PropTypes.shape({
      form_timestamp: PropTypes.string.isRequired,
      survey_text: PropTypes.string.isRequired
    }).isRequired
  })
};


export const STUDENT_VOICE_SURVEY_RESPONSE_INSIGHT_TYPE = 'student_voice_survey_response';
