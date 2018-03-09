import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import fetchMock from 'fetch-mock/es5/client';
import HomeFeed, {HomeFeedPure} from './HomeFeed';
import SpecSugar from '../../../../spec/javascripts/support/spec_sugar.jsx';
import {withDefaultNowContext} from '../../../../spec/javascripts/support/NowContainer';
import homeFeedJson from '../../../../spec/javascripts/fixtures/home_feed_json';




beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/home/feed_json?limit=20&time_now=1520938986', homeFeedJson);
});

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<HomeFeed />), el);
});

SpecSugar.withTestEl('integration tests', container => {
  it('renders everything after fetch', done => {
    const el = container.testEl;
    ReactDOM.render(withDefaultNowContext(<HomeFeed />), el);
    
    setTimeout(() => {
      expect($(el).find('.EventNoteCard').length).toEqual(19);
      expect($(el).find('.BirthdayCard').length).toEqual(1);
      done();
    }, 0);
  });
});

it('pure component matches snapshot', () => {
  const tree = renderer
    .create(withDefaultNowContext(<HomeFeedPure feedCards={homeFeedJson.feed_cards} />))
    .toJSON();
  expect(tree).toMatchSnapshot();
});
