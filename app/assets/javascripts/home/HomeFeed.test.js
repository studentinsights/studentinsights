import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import renderer from 'react-test-renderer';
import _ from 'lodash';
import fetchMock from 'fetch-mock/es5/client';
import HomeFeed, {mergeCards, HomeFeedPure} from './HomeFeed';
import SpecSugar from '../../../../spec/javascripts/support/spec_sugar.jsx';
import {withDefaultNowContext} from '../../../../spec/javascripts/support/NowContainer';
import homeFeedJson from '../../../../spec/javascripts/fixtures/home_feed_json';


function testProps() {
  return {
    educatorId: 9999
  };
}

// This is a note recorded a day before the last note in the 
// `homeFeedJson` fixture.
function moreCardsJson() {
  return {
    "feed_cards": [{
      "type": "event_note_card",
      "timestamp": "2011-09-07T21:21:35.305Z",
      "json": {
        "id": 3217,
        "event_note_type_id": 301,
        "text": "Something happened with Winnie Disney",
        "recorded_at": "2011-09-07T21:21:35.305Z",
        "educator": {
          "id": 1,
          "email": "uri@demo.studentinsights.org",
          "full_name": "Disney, Uri"
        },
        "student": {
          "id": 18,
          "grade": "KF",
          "first_name": "Winnie",
          "last_name": "Disney",
          "house": null,
          "homeroom": {
            "id": 1,
            "name": "HEA 003",
            "educator": {
              "id": 2,
              "email": "vivian@demo.studentinsights.org",
              "full_name": "Teacher, Vivian"
            }
          }
        }
      }
    }]
  };
}

function expectRenderedFeed(el, options = {}) {
  expect($(el).find('.EventNoteCard').length).toEqual(options.eventNoteCards);
  expect($(el).find('.BirthdayCard').length).toEqual(options.birthdayCards);
  expect($(el).find('.HomeFeed-load-more').length).toEqual(options.seeMoreLinks);
}

describe('HomeFeed', () => {
  beforeEach(() => {
    fetchMock.restore();
    fetchMock.get('/home/feed_json?educator_id=9999&limit=10&time_now=1520938986', homeFeedJson);
    fetchMock.get('/home/feed_json?educator_id=9999&limit=10&time_now=1315440000', moreCardsJson());
  });

  it('renders without crashing', () => {
    const props = testProps();
    const el = document.createElement('div');
    ReactDOM.render(withDefaultNowContext(<HomeFeed {...props} />), el);
  });

  SpecSugar.withTestEl('integration tests', container => {
    it('renders everything after fetch', done => {
      const props = testProps();
      const el = container.testEl;
      ReactDOM.render(withDefaultNowContext(<HomeFeed {...props} />), el);
      
      setTimeout(() => {
        expectRenderedFeed(el, {
          eventNoteCards: 19,
          birthdayCards: 1,
          seeMoreLinks: 1
        });
        done();
      }, 0);
    });

    it('can load more data and render it', done => {
      const props = testProps();
      const el = container.testEl;
      ReactDOM.render(withDefaultNowContext(<HomeFeed {...props} />), el);
      
      setTimeout(() => {
        expectRenderedFeed(el, {
          eventNoteCards: 19,
          birthdayCards: 1,
          seeMoreLinks: 1
        });
        ReactTestUtils.Simulate.click($(el).find('.HomeFeed-load-more').get(0));
        setTimeout(() => {
          expectRenderedFeed(el, {
            eventNoteCards: 20,
            birthdayCards: 1,
            seeMoreLinks: 1
          });
          done();
        }, 0);
      }, 0);
    });
  });
});

describe('HomeFeedPure', () => {
  it('pure component matches snapshot', () => {
    const tree = renderer
      .create(withDefaultNowContext(<HomeFeedPure feedCards={homeFeedJson.feed_cards} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});


describe('#mergeCards', () => {
  it('works', () => {
    const moreCards = moreCardsJson().feed_cards;
    const mergedCards = mergeCards(homeFeedJson.feed_cards, moreCards);
    expect(mergedCards.length).toEqual(21);
    expect(_.last(mergedCards)).toEqual(_.first(moreCards));
  });

  it('preserves server sort order for events on same date', () => {
    const previousCards = homeFeedJson.feed_cards;
    const mergedCards = mergeCards(previousCards, []);
    expect(mergedCards.length).toEqual(previousCards.length);
    expect(mergedCards).toEqual(previousCards);
  });
});