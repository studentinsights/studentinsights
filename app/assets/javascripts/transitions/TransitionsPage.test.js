import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from 'enzyme';
import fetchMock from 'fetch-mock/es5/client';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import TransitionsPage from './TransitionsPage';
import transitionStudentsJson from './TransitionsPage.fixture';

function testProps() {
  return {
    currentEducator: {
      id: 9999,
      labels: []
    }
  };
}

function testEl(props = {}) {
  return withDefaultNowContext(
    <PerDistrictContainer districtKey="somerville">
      <TransitionsPage {...props} />
    </PerDistrictContainer>
  );
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/second_transition_notes/transition_students_json', transitionStudentsJson);
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
      expect(wrapper.html()).toContain('School transitions');
      done();
    }, 0);
  });
});
