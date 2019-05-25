import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import NotesFeed from './NotesFeed';
import json from './myNotesJson.fixture';

export function testProps(props = {}) {
  return {
    totalNotesCount: json.total_notes_count,
    mixedEventNotes: json.mixed_event_notes,
    canUserAccessRestrictedNotes: false,
    onClickLoadMoreNotes: jest.fn(),
    ...props
  };
}

export function testEl(props = {}) {
  return withDefaultNowContext(
    <PerDistrictContainer districtKey="somerville">
      <NotesFeed {...props} />
    </PerDistrictContainer>
  );
}


it('renders empty case without crashing', () => {
  const props = testProps({ mixedEventNotes: [], totalNotesCount: 0 });
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el);
});

it('snapshots view', () => {
  const tree = renderer
    .create(testEl(testProps()))
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('snapshots view for restricted', () => {
  const props = testProps({canUserAccessRestrictedNotes: true});
  const tree = renderer
    .create(testEl(props))
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('snapshots view with wordcloud', () => {
  const props = testProps({showWordCloud: true});
  const tree = renderer
    .create(testEl(props))
    .toJSON();
  expect(tree).toMatchSnapshot();
});