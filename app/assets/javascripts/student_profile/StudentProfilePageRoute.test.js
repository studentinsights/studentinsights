import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from 'enzyme';
import fetchMock from 'fetch-mock/es5/client';
import PerDistrictContainer from '../components/PerDistrictContainer';
import mockHistory from '../testing/mockHistory';
import {withDefaultNowContext} from '../testing/NowContainer';
import StudentProfilePageRoute from './StudentProfilePageRoute';
import profileJsonForRyanRodriguez from './fixtures/profileJsonForRyanRodriguez.fixture';


function testProps(props = {}) {
  return {
    studentId: 2,
    queryParams: {},
    history: mockHistory(),
    ...props
  };
}

function testEl(props = {}) {
  return withDefaultNowContext(
    <PerDistrictContainer districtKey="somerville">
      <StudentProfilePageRoute {...props} />
    </PerDistrictContainer>
  );
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/students/2/profile_json', profileJsonForRyanRodriguez);
});

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el);
});

describe('integration tests', () => {
  it('renders without crashing after fetch', done => {
    const props = testProps();
    const wrapper = mount(testEl(props));
    expect(wrapper.text()).toContain('Loading...');

    setTimeout(() => {
      expect(wrapper.html()).toContain('Ryan Rodriguez');
      done();
    }, 0);
  });
});
