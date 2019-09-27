import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from 'enzyme';
import fetchMock from 'fetch-mock/es5/client';
import EducatorsWithAccessToStudentDialog from './EducatorsWithAccessToStudentDialog';
import fixtureJson from './EducatorsWithAccessToStudentDialog.fixture';

function testProps(props = {}) {
  return {
    studentId: 42,
    ...props
  };
}

function testEl(props = {}) {
  return <EducatorsWithAccessToStudentDialog {...props} />;
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/students/42/educators_with_access_json', fixtureJson);
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
      expect(wrapper.html()).toContain('Show list of educators');
      expect(wrapper.text()).toContain('districtwide2');
      expect(wrapper.text()).toContain('schoolwide1');
      expect(wrapper.text()).toContain('homeroom1');
      expect(wrapper.text()).toContain('total4');
      done();
    }, 0);
  });
});
