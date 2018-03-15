import React from 'react';
import SpecSugar from '../../../../spec/javascripts/support/spec_sugar.jsx';
import {withDefaultNowContext} from '../../../../spec/javascripts/support/NowContainer';
import fetchMock from 'fetch-mock/es5/client';
import EducatorPage from './EducatorPage';
import educatorsViewJson from '../../../../spec/javascripts/fixtures/educatorsViewJson';


function testProps() {
  return {
    educatorId: 101
  };
}

jest.mock('../home/HomePage');
beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/educators/101', educatorsViewJson);
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
      done();
    }, 0);
  });
});