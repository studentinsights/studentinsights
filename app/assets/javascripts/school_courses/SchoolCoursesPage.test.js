import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../testing/NowContainer';
import fetchMock from 'fetch-mock/es5/client';
import SchoolCoursesPage, {SchoolCoursesPagePure} from './SchoolCoursesPage';
import schoolCoursesJson from './schoolCoursesJson';


function testProps() {
  return {
    schoolId: '42'
  };
}

function testRenderWithEl(props) {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<SchoolCoursesPage {...props} />), el);
  return {el};
}


beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/schools/42/courses', schoolCoursesJson);
});

it('renders without crashing', () => {
  const props = testProps();
  testRenderWithEl(props);
});

it('renders everything after fetch', done => {
  const props = testProps();
  const {el} = testRenderWithEl(props);
  expect(el.innerHTML).toContain('This is an experimental prototype page!');

  setTimeout(() => {
    expect($(el).find('table tbody tr').length).toEqual(3);
    done();
  }, 0);
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

