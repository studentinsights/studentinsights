import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from 'enzyme';
import fetchMock from 'fetch-mock/es5/client';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import SearchNotesPage from './SearchNotesPage';
import searchJson from './searchJson.fixture';

function testProps() {
  return {
    educatorId: 9999,
    educatorLabels: []
  };
}

function testEl(props = {}) {
  return withDefaultNowContext(
    <PerDistrictContainer districtKey="somerville">
      <SearchNotesPage {...props} />
    </PerDistrictContainer>
  );
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/search_notes/query_json?event_note_type_id&grade&limit&scope_key&text=', searchJson);
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
      expect(wrapper.html()).toContain('Search notes');
      expect(wrapper.text()).toContain('Showing all 2 results.');
      expect($(wrapper.html()).find('.EventNoteCard').length).toEqual(2);
      done();
    }, 0);
  });
});
