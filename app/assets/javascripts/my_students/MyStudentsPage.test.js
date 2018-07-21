import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from 'enzyme';
import fetchMock from 'fetch-mock/es5/client';
import PerDistrictContainer from '../components/PerDistrictContainer';
import MyStudentsPage from './MyStudentsPage';
import myStudentsJson from './myStudentsJson.fixture';

function testProps() {
  return {};
}

function testEl(props = {}) {
  return (
    <PerDistrictContainer districtKey="somerville">
      <MyStudentsPage {...props} />
    </PerDistrictContainer>
  );
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/educators/my_students_json', myStudentsJson);
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
      expect(wrapper.html()).toContain('My students');
      done();
    }, 0);
  });
});
