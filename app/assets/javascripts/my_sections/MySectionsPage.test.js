import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from 'enzyme';
import fetchMock from 'fetch-mock/es5/client';
import MySectionsPage from './MySectionsPage';
import mySectionsJson from './mySectionsJson.fixture';

function testProps(props = {}) {
  return {
    currentEducatorId: 42,
    ...props
  };
}

function testEl(props = {}) {
  return <MySectionsPage {...props} />;
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/educators/my_sections_json', mySectionsJson);
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
      expect(wrapper.html()).toContain('My sections');
      done();
    }, 0);
  });
});
