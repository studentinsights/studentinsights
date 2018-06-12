import React from 'react';
import {mount} from 'enzyme';
import renderer from 'react-test-renderer';
import _ from 'lodash';
import FilterStudentsBar from './FilterStudentsBar';
import myStudentsJson from './myStudentsJson.fixture';

function testProps(props = {}) {
  return {
    students: myStudentsJson.students,
    children: jest.fn(),
    ...props
  };
}


function testRender(props) {
  const wrapper = mount(<FilterStudentsBar {...props} />);
  return {wrapper};
}

it('renders without crashing', () => {
  const {wrapper} = testRender(testProps());
  expect(wrapper.text()).toContain('Filter by');
  expect(wrapper.text()).toContain('House...');
  expect(wrapper.text()).toContain('Grade...');
  expect(wrapper.text()).toContain('Counselor...');
});

it('filters students by grade', () => {
  const props = testProps();
  const {wrapper} = testRender(props);
  const studentsBeforeClick = props.children.mock.calls[0][0];
  expect(studentsBeforeClick.length).toEqual(myStudentsJson.students.length);
  wrapper.instance().onGradeChanged('10');

  const studentsAfterClick = props.children.mock.calls[1][0];
  expect(studentsAfterClick.length).toEqual(55);
  expect(_.uniq(studentsAfterClick.map(student => student.grade))).toEqual(['10']);
});

it('filters students by house', () => {
  const props = testProps();
  const {wrapper} = testRender(props);
  const studentsBeforeClick = props.children.mock.calls[0][0];
  expect(studentsBeforeClick.length).toEqual(myStudentsJson.students.length);
  wrapper.instance().onHouseChanged('Elm');

  const studentsAfterClick = props.children.mock.calls[1][0];
  expect(studentsAfterClick.length).toEqual(11);
  expect(_.uniq(studentsAfterClick.map(student => student.house))).toEqual(['Elm']);
});

it('filters students by counselor', () => {
  const props = testProps();
  const {wrapper} = testRender(props);
  const studentsBeforeClick = props.children.mock.calls[0][0];
  expect(studentsBeforeClick.length).toEqual(myStudentsJson.students.length);
  wrapper.instance().onCounselorChanged('WOODY');

  const studentsAfterClick = props.children.mock.calls[1][0];
  expect(studentsAfterClick.length).toEqual(22);
  expect(_.uniq(studentsAfterClick.map(student => student.counselor))).toEqual(['WOODY']);
});

it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(<FilterStudentsBar {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
