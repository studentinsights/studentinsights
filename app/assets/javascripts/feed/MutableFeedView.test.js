import React from 'react';
import renderer from 'react-test-renderer';
import MutableFeedView from './MutableFeedView';
import {withDefaultNowContext} from '../testing/NowContainer';
import homeFeedJson from '../testing/fixtures/home_feed_json';


describe('MutableFeedView', () => {
  it('pure component matches snapshot', () => {
    const tree = renderer
      .create(withDefaultNowContext(
        <MutableFeedView
          defaultFeedCards={homeFeedJson.feed_cards}
          educatorLabels={['can_mark_notes_as_restricted']}
        />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

