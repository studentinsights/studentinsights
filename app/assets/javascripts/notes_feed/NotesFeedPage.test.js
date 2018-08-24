import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import NotesFeedPage from './NotesFeedPage';
import {serializedData} from './NotesFeedPage.fixture';

export function testProps(props = {}) {
  const {educatorsIndex, notes, totalNotesCount} = serializedData;
  return {
    educatorsIndex,
    totalNotesCount,
    eventNotes: notes,
    onClickLoadMoreNotes: jest.fn(),
    ...props
  };
}

it('renders empty case without crashing', () => {
  const props = testProps({ eventNotes: [], totalNotesCount: 0 });
  const el = document.createElement('div');
  ReactDOM.render(<NotesFeedPage {...props} />, el);
});

it('snapshots view', () => {
  const tree = renderer
    .create(<NotesFeedPage {...testProps()} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});