import {
  reordered,
  studentsInRoom,
  studentIdsByRoomAfterRoomsCountChanged,
  UNPLACED_ROOM_KEY
} from './studentIdsByRoomFunctions';
import students_for_grade_level_next_year_json from './fixtures/students_for_grade_level_next_year_json';

it('#reordered', () => {
  const items = ['a', 'b', 'c', 'd', 'e'];
  expect(reordered(items, 2, 0)).toEqual(['c', 'a', 'b', 'd', 'e']);
  expect(reordered(items, 1, 4)).toEqual(['a', 'c', 'd', 'e', 'b']);
});

it('#studentsInRoom', () => {
  const students = students_for_grade_level_next_year_json.students.slice(0, 3);
  const [a, b, c] = students;
  const studentIdsByRoom = {
    "room:3": [b.id, a.id],
    "room:4": [c.id]
  };
  expect(studentsInRoom(students, studentIdsByRoom, 'room:3')).toEqual([b, a]);
  expect(studentsInRoom(students, studentIdsByRoom, 'room:4')).toEqual([c]);
});


describe('#studentIdsByRoomAfterRoomsCountChanged', () => {
  it('remove a room', () => {
    expect(studentIdsByRoomAfterRoomsCountChanged({
      [UNPLACED_ROOM_KEY]: [6, 7],
      "room:0": [1, 2],
      "room:1": [3],
      "room:2": [4, 5]
    }, 2)).toEqual({
      [UNPLACED_ROOM_KEY]: [6, 7, 4, 5],
      "room:0": [1, 2],
      "room:1": [3]
    });
  });

  it('add rooms', () => {
    expect(studentIdsByRoomAfterRoomsCountChanged({
      [UNPLACED_ROOM_KEY]: [6, 7],
      "room:0": [1, 2],
      "room:1": [3],
      "room:2": [4, 5]
    }, 5)).toEqual({
      [UNPLACED_ROOM_KEY]: [6, 7],
      "room:0": [1, 2],
      "room:1": [3],
      "room:2": [4, 5],
      "room:3": [],
      "room:4": []
    });
  });
});