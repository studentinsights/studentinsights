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
});

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el);
});

describe('integration tests', () => {
  it('renders after fetch', done => {
    fetchMock.get('/api/search_notes/query_json?end_time_utc=1520938986&event_note_type_id&grade&limit=50&scope_key&start_time_utc=1502755200&text=read', searchJson);

    // renders, without fetching yet
    const props = testProps();
    const el = document.createElement('div');
    ReactDOM.render(testEl(props), el);
    expect($(el).text()).toContain('What do you want to know about?');
    
    // change text, wait for debounce
    changeTextValue($(el).find('input:first').get(0), 'read');
    setTimeout(() => {
      expect($(el).html()).not.toContain('Showing all 2 results.');
    
      // wait for fetch and render
      setTimeout(() => {
        expect($(el).html()).toContain('Search notes');
        expect($(el).text()).toContain('Showing all 2 results.');
        expect($(el).find('.EventNoteCard').length).toEqual(2);
        done();
      }, 0);
    }, 400);
  });

  it('enforces minimum search length', done => {
    const props = testProps();
    const el = document.createElement('div');
    ReactDOM.render(testEl(props), el);
    
    changeTextValue($(el).find('input:first').get(0), 're');

    // wait for debounce
    setTimeout(() => {
      expect($(el).html()).not.toContain('Loading');
      expect($(el).html()).not.toContain('Showing all 2 results.');
      expect($(el).text()).toContain('What do you want to know about?');
      done();
    }, 400);
  });
});
