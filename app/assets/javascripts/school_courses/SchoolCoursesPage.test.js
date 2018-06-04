import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import SpecSugar from '../../../../spec/javascripts/support/spec_sugar';
import {withDefaultNowContext} from '../../../../spec/javascripts/support/NowContainer';
import fetchMock from 'fetch-mock/es5/client';
import SchoolCoursesPage, {SchoolCoursesPagePure} from './SchoolCoursesPage';
import schoolCoursesJson from '../../../../spec/javascripts/fixtures/schoolCoursesJson';


function testProps() {
  return {
    schoolId: '42'
  };
}


beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/schools/42/courses', schoolCoursesJson);
});

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<SchoolCoursesPage {...props} />), el);
});

SpecSugar.withTestEl('integration tests', container => {
  it('renders everything after fetch', done => {
    const props = testProps();
    const el = container.testEl;
    ReactDOM.render(withDefaultNowContext(<SchoolCoursesPage {...props} />), el);
    expect(el.innerHTML).toContain('This is an experimental prototype page!');

    setTimeout(() => {
      expect($(el).find('table tbody tr').length).toEqual(3);
      done();
    }, 0);
  });
});


describe('SchoolCoursesPagePure', () => {
  it('pure component matches snapshot', () => {
    const {courses, school} = schoolCoursesJson;
    const tree = renderer
      .create(withDefaultNowContext(<SchoolCoursesPagePure courses={courses} school={school} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

