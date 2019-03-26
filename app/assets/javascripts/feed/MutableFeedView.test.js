import React from 'react';
import renderer from 'react-test-renderer';
import MutableFeedView from './MutableFeedView';
import {withDefaultNowContext} from '../testing/NowContainer';
import homeFeedJson from '../testing/fixtures/home_feed_json';
import PerDistrictContainer from '../components/PerDistrictContainer';

describe('MutableFeedView', () => {
  it('pure component matches snapshot', () => {
    const tree = renderer
      .create(withDefaultNowContext(
        <PerDistrictContainer districtKey="somerville">
          <MutableFeedView
            defaultFeedCards={homeFeedJson.feed_cards}
            educatorLabels={['can_mark_notes_as_restricted']}
          />
        </PerDistrictContainer>
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

