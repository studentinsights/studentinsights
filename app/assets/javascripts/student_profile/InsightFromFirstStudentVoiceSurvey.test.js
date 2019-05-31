import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import InsightFromFirstStudentVoiceSurvey from './InsightFromFirstStudentVoiceSurvey';

function testProps(props) {
  return {
    insightPayload: {
      prompt_key: 'proud',
      prompt_text: 'What are you most proud of?',
      survey_response_text: 'Doing well in English and starting the recyling club.',
      student_voice_completed_survey: {
        form_timestamp: '2017-12-16T00:00:00.000Z',
        survey_text: '<full survey text>'
      }
    },
    student: {
      id: 42,
      first_name: 'Mari',
      last_name: 'Kenobi'
    },
    ...props
  };
}

// since element sizing methods aren't present in the Jest JS environment
jest.mock('../components/FitText', () => 'mocked-fit-text');

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<InsightFromFirstStudentVoiceSurvey {...testProps()} />, el);
});

it('snapshots view', () => {
  const tree = renderer
    .create(<InsightFromFirstStudentVoiceSurvey {...testProps()} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});