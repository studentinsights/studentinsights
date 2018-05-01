import {reordered, studentsInRoom} from './studentIdsByRoomFunctions';
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