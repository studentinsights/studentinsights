import React from 'react';
import ReactDOM from 'react-dom';
import fetchMock from 'fetch-mock/es5/client';
import changeTextValue from '../testing/changeTextValue';
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
    fetchMock.get('/api/search_notes/query_json?event_note_type_id&grade&limit&scope_key&text=read', searchJson);

    // renders, without fetching yet
    const props = testProps();
    const el = document.createElement('div');
    ReactDOM.render(testEl(props), el);
    expect($(el).text()).toContain('What do you want to know about?');
    
    // change text, wait for debounce, fetch, render
    changeTextValue($(el).find('input:first').get(0), 'read');
    setTimeout(() => {
      expect($(el).html()).not.toContain('Loading');
      expect($(el).html()).not.toContain('Showing all 2 results.');
    
      setTimeout(() => {
        expect($(el).html()).toContain('Search notes');
        expect($(el).text()).toContain('Showing all 2 results.');
        expect($(el).find('.EventNoteCard').length).toEqual(2);
        done();
      }, 400);
    });
  });
});
