import React from 'react';
import renderer from 'react-test-renderer';
import FeedView from './FeedView';
import {withDefaultNowContext} from '../../../../spec/javascripts/support/NowContainer';
import homeFeedJson from '../../../../spec/javascripts/fixtures/home_feed_json';


describe('FeedView', () => {
  it('pure component matches snapshot', () => {
    const tree = renderer
      .create(withDefaultNowContext(<FeedView feedCards={homeFeedJson.feed_cards} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

