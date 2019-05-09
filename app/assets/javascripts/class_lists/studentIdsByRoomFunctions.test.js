import {
  reordered,
  studentsInRoom,
  studentIdsByRoomAfterRoomsCountChanged,
  resolveDriftForStudents,
  consistentlyPlacedInitialStudentIdsByRoom,
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

describe('#resolveDriftForStudents', () => {
  it('removes students who are no longer active', () => {
    expect(resolveDriftForStudents({
      [UNPLACED_ROOM_KEY]: [4],
      "room:0": [1, 2],
      "room:1": [3],
    }, [1, 3, 4])).toEqual({
      [UNPLACED_ROOM_KEY]: [4],
      "room:0": [1],
      "room:1": [3],
    });
  });

  it('adds in new students as unplaced and puts them first in the list', () => {
    expect(resolveDriftForStudents({
      [UNPLACED_ROOM_KEY]: [4],
      "room:0": [1, 2],
      "room:1": [3],
    }, [1, 2, 3, 4, 99])).toEqual({
      [UNPLACED_ROOM_KEY]: [99, 4],
      "room:0": [1, 2],
      "room:1": [3],
    });
  });
});

describe('#consistentlyPlacedInitialStudentIdsByRoom', () => {
  it('works across different room counts', () => {
    const testStudents = [{id: 4}, {id: 7}];
    expect(consistentlyPlacedInitialStudentIdsByRoom(2, testStudents)).toEqual({
      'room:unplaced': [],
      'room:0': [4, 7],
      'room:1': [],
    });
    expect(consistentlyPlacedInitialStudentIdsByRoom(3, testStudents)).toEqual({
      'room:unplaced': [],
      'room:0': [7],
      'room:1': [],
      'room:2': [4],
    });
    expect(consistentlyPlacedInitialStudentIdsByRoom(5, testStudents)).toEqual({
      'room:unplaced': [],
      'room:0': [],
      'room:1': [4],
      'room:2': [],
      'room:3': [],
      'room:4': [7],
    });
  });

  // This verified regressions separate from snapshot changes, many of which are
  // sensitive to changes in how this hashing works.
  it('is consistent and based only on id field', () => {
    const roomCount = 3;
    expect(consistentlyPlacedInitialStudentIdsByRoom(roomCount, [{id: 5}, {id: 9}])).toEqual({
      'room:unplaced': [],
      'room:0': [5],
      'room:1': [],
      'room:2': [9],
    });
    expect(consistentlyPlacedInitialStudentIdsByRoom(roomCount, [{id: 9}, {id: 5}])).toEqual({
      'room:unplaced': [],
      'room:0': [5],
      'room:1': [],
      'room:2': [9],
    });
    expect(consistentlyPlacedInitialStudentIdsByRoom(roomCount, students_for_grade_level_next_year_json.students)).toEqual({
      'room:unplaced': [],
      'room:0': [1, 12, 5],
      'room:1': [13, 11],
      'room:2': [8, 9],
    });
  });
});
