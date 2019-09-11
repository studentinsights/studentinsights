import React from 'react';
import {mount} from 'enzyme';
import renderer from 'react-test-renderer';
import _ from 'lodash';
import FilterStudentsBar, {searchTextMatches} from './FilterStudentsBar';
import fixtureJson from './FilterStudentsBar.fixture';

function testProps(props = {}) {
  return {
    students: fixtureJson.students,
    children: jest.fn(),
    includeHomeroom: true,
    includeCounselor: true,
    includeHouse: true,
    includeTimeRange: false,
    ...props
  };
}


function testRender(props) {
  const wrapper = mount(<FilterStudentsBar {...props} />);
  return {wrapper};
}

it('renders without crashing', () => {
  const props = testProps();
  const {wrapper} = testRender(props);
  expect(wrapper.text()).toContain('Filter by');
  expect(wrapper.text()).toContain('Grade...');
  expect(wrapper.text()).toContain('Homeroom...');
  expect(wrapper.text()).toContain('House...');
  expect(wrapper.text()).toContain('Counselor...');
  expect(props.students.length).toEqual(98);
});


describe('respects what to include', () => {
  it('respects includeHomeroom', () => {
    const props = testProps({includeHomeroom: false});
    expect(testRender(props).wrapper.text()).not.toContain('Homeroom...');
  });
  it('respects includeCounselor', () => {
    const props = testProps({includeCounselor: false});
    expect(testRender(props).wrapper.text()).not.toContain('Counselor...');
  });
  it('respects includeHouse', () => {
    const props = testProps({includeHouse: false});
    expect(testRender(props).wrapper.text()).not.toContain('House...');
  });
});

it('filters students by grade', () => {
  const props = testProps();
  const {wrapper} = testRender(props);
  const studentsBeforeClick = props.children.mock.calls[0][0];
  expect(studentsBeforeClick.length).toEqual(fixtureJson.students.length);
  wrapper.instance().onGradeChanged('10');

  const studentsAfterClick = props.children.mock.calls[1][0];
  expect(studentsAfterClick.length).toEqual(52);
  expect(_.uniq(studentsAfterClick.map(student => student.grade))).toEqual(['10']);
});

it('filters students by homeroom', () => {
  const props = testProps();
  const {wrapper} = testRender(props);
  const studentsBeforeClick = props.children.mock.calls[0][0];
  expect(studentsBeforeClick.length).toEqual(fixtureJson.students.length);
  wrapper.instance().onHomeroomChanged('1'); // HEA 003

  const studentsAfterClick = props.children.mock.calls[1][0];
  expect(studentsAfterClick.length).toEqual(7);
  expect(_.uniq(studentsAfterClick.map(student => student.homeroom.id))).toEqual([1]);
});

it('filters students by house', () => {
  const props = testProps();
  const {wrapper} = testRender(props);
  const studentsBeforeClick = props.children.mock.calls[0][0];
  expect(studentsBeforeClick.length).toEqual(fixtureJson.students.length);
  wrapper.instance().onHouseChanged('Elm');

  const studentsAfterClick = props.children.mock.calls[1][0];
  expect(studentsAfterClick.length).toEqual(9);
  expect(_.uniq(studentsAfterClick.map(student => student.house))).toEqual(['Elm']);
});

it('filters students by counselor', () => {
  const props = testProps();
  const {wrapper} = testRender(props);
  const studentsBeforeClick = props.children.mock.calls[0][0];
  expect(studentsBeforeClick.length).toEqual(fixtureJson.students.length);
  wrapper.instance().onCounselorChanged('WOODY');

  const studentsAfterClick = props.children.mock.calls[1][0];
  expect(studentsAfterClick.length).toEqual(28);
  expect(_.uniq(studentsAfterClick.map(student => student.counselor))).toEqual(['WOODY']);
});

it('snapshots with all options but timeRange', () => {
  const props = testProps();
  const tree = renderer
    .create(<FilterStudentsBar {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('snapshots without options', () => {
  const props = testProps({
    includeHouse: false,
    includeHomeroom: false,
    includeCounselor: false,
    includeTimeRange: false
  });
  const tree = renderer
    .create(<FilterStudentsBar {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('snapshots with mock timeRange', () => {
  const props = testProps({
    includeTimeRange: true,
    timeFilterFn(student) { return (student.id < 100); }
  });
  const tree = renderer
    .create(<FilterStudentsBar {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

describe('searchTextMatches', () => {
  it('works', () => {
    const matches = fixtureJson.students.filter(student => (
      searchTextMatches('somerville', 'PluTO WoODy', student)
    ));
    expect(fixtureJson.students.length).toEqual(98);
    expect(matches.length).toEqual(2);
  });
});