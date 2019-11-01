import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from 'enzyme';
import fetchMock from 'fetch-mock/es5/client';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import ReflectionOnNotesPage from './ReflectionOnNotesPage';
import fixtureJson from './ReflectionOnNotesPage.fixture';

function testProps() {
  return {};
}

function testEl(props = {}) {
  return withDefaultNowContext(
    <PerDistrictContainer districtKey="somerville">
      <ReflectionOnNotesPage {...props} />
    </PerDistrictContainer>
  );
}

jest.mock('../components/WordCloud'); // requires real DOM

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/reflection/notes_patterns_json', fixtureJson);
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
      expect(wrapper.html()).toContain('Reflection on notes');
      expect($(wrapper.html()).find('.BoxCard').length).toEqual(10);
      expect($(wrapper.html()).find('.StudentPhoto').length).toEqual(10);
      expect(wrapper.text()).toContain('More');
      done();
    }, 0);
  });
});
