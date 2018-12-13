import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../testing/NowContainer';
import NotesFeed from './NotesFeed';
import {serializedData} from './NotesFeed.fixture';

export function testProps(props = {}) {
  const {educatorsIndex, notes, totalNotesCount} = serializedData;
  return {
    currentEducatorId: 999999,
    educatorsIndex,
    totalNotesCount,
    eventNotes: notes,
    canUserAccessRestrictedNotes: false,
    onClickLoadMoreNotes: jest.fn(),
    ...props
  };
}

it('renders empty case without crashing', () => {
  const props = testProps({ eventNotes: [], totalNotesCount: 0 });
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<NotesFeed {...props} />), el);
});

it('snapshots view', () => {
  const tree = renderer
    .create(withDefaultNowContext(<NotesFeed {...testProps()} />))
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('snapshots view with wordcloud', () => {
  const tree = renderer
    .create(withDefaultNowContext(<NotesFeed {...testProps({showWordCloud: true})} />))
    .toJSON();
  expect(tree).toMatchSnapshot();
});