import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../../../../spec/javascripts/support/NowContainer';
import ClassroomStats from './ClassroomStats';
import students_for_grade_level_next_year_json from './fixtures/students_for_grade_level_next_year_json';
import {
  createRooms,
  roomKeyFromIndex,
  initialStudentIdsByRoom
} from './studentIdsByRoomFunctions';

export function testProps(props = {}) {
  const rooms = createRooms(4);
  const {students} = students_for_grade_level_next_year_json;
  return {
    rooms,
    students,
    gradeLevelNextYear: '5',
    studentIdsByRoom: initialStudentIdsByRoom(rooms.length, students, {
      placementFn(studentIdsByRoom, student) {
        const roomIndex = JSON.stringify(student).length % rooms.length; // consistent hash
        return roomKeyFromIndex(roomIndex);
      }
    }),
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(withDefaultNowContext(<ClassroomStats {...props} />), el);
});


it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(withDefaultNowContext(<ClassroomStats {...props} />))
    .toJSON();
  expect(tree).toMatchSnapshot();
});