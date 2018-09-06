import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from 'enzyme';
import fetchMock from 'fetch-mock/es5/client';
import StudentVoiceSurveyUploadsPage from './StudentVoiceSurveyUploadsPage';
import studentVoiceSurveyUploadsJson from './studentVoiceSurveyUploadsJson.fixture';

function testProps(props = {}) {
  return {
    currentEducatorId: 42,
    ...props
  };
}

function testEl(props = {}) {
  return <StudentVoiceSurveyUploadsPage {...props} />;
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/admin/api/student_voice_survey_uploads', studentVoiceSurveyUploadsJson);
});

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el);
});

describe('integration tests', () => {
  it('renders after fetch', done => {
    const props = testProps();
    const wrapper = mount(testEl(props));
    expect(wrapper.text()).toContain('Loading...');

    setTimeout(() => {
      expect(wrapper.html()).toContain('Student Voice Survey Uploads');
      expect(wrapper.html()).toContain('Upload CSV');
      expect(wrapper.html()).toContain('student_voice_survey_v2.csv');
      expect(wrapper.html()).toContain('a168104b');
      done();
    }, 0);
  });
});
