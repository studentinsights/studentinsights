import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from 'enzyme';
import fetchMock from 'fetch-mock/es5/client';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import MyNotesPage from './MyNotesPage';
import myNotesJson from './myNotesJson.fixture';

function testProps() {
  return {};
}

function testEl(props = {}) {
  return withDefaultNowContext(
    <PerDistrictContainer districtKey="somerville">
      <MyNotesPage {...props} />
    </PerDistrictContainer>
  );
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/educators/my_notes_json?batch_size=60', myNotesJson);
});

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el);
});

describe('integration tests', () => {
  it('renders after fetch', done => {
    const props = testProps();
    const wrapper = mount(testEl(props));
    expect(wrapper.text()).toContain('Loading...');

    setTimeout(() => {
      expect(wrapper.html()).toContain('My notes');
      expect($(wrapper.html()).find('.EventNoteCard').length).toEqual(2);
      expect($(wrapper.html()).find('.NoteCard-substance').length).toEqual(2);
      expect(wrapper.html()).not.toContain('redacted');
      done();
    }, 0);
  });
});
