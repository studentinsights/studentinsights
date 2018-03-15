import React from 'react';
import ReactDOM from 'react-dom';
import EducatorPage from './EducatorPage';
import SpecSugar from '../../../../spec/javascripts/support/spec_sugar.jsx';
import {withDefaultNowContext} from '../../../../spec/javascripts/support/NowContainer';
import fetchMock from 'fetch-mock/es5/client';
import educatorsViewJson from '../../../../spec/javascripts/fixtures/educatorsViewJson';
import homeFeedJson from '../../../../spec/javascripts/fixtures/home_feed_json';
import unsupportedLowGradesJson from '../../../../spec/javascripts/fixtures/home_unsupported_low_grades_json';

function testProps() {
  return {
    educatorId: 101
  };
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/educators/101', educatorsViewJson);
  fetchMock.get('/home/feed_json?educator_id=101&limit=20&time_now=1520938986', homeFeedJson);
  fetchMock.get('/home/unsupported_low_grades_json?educator_id=101&limit=100', unsupportedLowGradesJson);
});

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<EducatorPage {...props} />), el);
});

SpecSugar.withTestEl('integration tests', container => {
  it('renders everything after fetch', done => {
    const props = testProps();
    const el = container.testEl;
    ReactDOM.render(withDefaultNowContext(<EducatorPage {...props} />), el);
    expect(el.innerHTML).toContain('This is an experimental prototype page!');

    setTimeout(() => {
      const text = $(el).text();
      expect(text).toContain('Educator info');
      expect(text).toContain('Name: Hugo Teacher');
      expect(text).toContain('Sections:');
      expect($(el).find('.Section').length).toEqual(2);

      expect(text).toContain('Home page');
      expect(text).toContain('Students to check on');
      expect($(el).find('.EventNoteCard').length).toEqual(19);
      expect($(el).find('.BirthdayCard').length).toEqual(1);
      done();
    }, 0);
  });
});