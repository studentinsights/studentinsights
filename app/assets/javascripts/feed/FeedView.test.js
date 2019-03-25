import React from 'react';
import renderer from 'react-test-renderer';
import FeedView from './FeedView';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import homeFeedJson from '../testing/fixtures/home_feed_json';


describe('FeedView', () => {
  it('pure component matches snapshot', () => {
    const tree = renderer
      .create(withDefaultNowContext(
        <PerDistrictContainer districtKey="somerville">
          <FeedView feedCards={homeFeedJson.feed_cards} />
        </PerDistrictContainer>
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

