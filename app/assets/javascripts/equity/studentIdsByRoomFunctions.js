import _ from 'lodash';


// Place the students into their initial state (eg, all unplaced, sorted alphabetically).
// {[roomKey]: [studentId]}
// Allow another placementFn to be passed.
export function initialStudentIdsByRoom(roomsCount, students, options = {}) {
  const initialMap = {
    [UNPLACED_ROOM_KEY]: []
  };
  const studentIdsByRoom = _.range(0, roomsCount).reduce((map, roomIndex) => {
    return {
      ...map,
      [roomKeyFromIndex(roomIndex)]: []
    };
  }, initialMap);

  const sortedStudents = _.sortBy(students, student => `${student.first_name}, ${student.last_name}`);
  sortedStudents.forEach(student => {
    const roomKey = (options.placementFn)
      ? options.placementFn(studentIdsByRoom, student)
      : UNPLACED_ROOM_KEY;

    studentIdsByRoom[roomKey].push(student.id);
  });

  return studentIdsByRoom;
}


export const UNPLACED_ROOM_KEY = 'room:unplaced';

// Helper functions related to moving students around.
export function roomKeyFromIndex(roomIndex) {
  return `room:${roomIndex}`;
}


// Returns array with item inserted.
export function insertedInto(items, insertIndex, itemToInsert) {
  const itemsCopy = items.slice();
  itemsCopy.splice(insertIndex, 0, itemToInsert);
  return itemsCopy;
}

// Returns array with items swapped locations.
export function reordered(items, fromIndex, toIndex) {
  const result = items.slice();
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

// TODO(kr) clarify the roomIndex / roomKey / null contract
// Expand the `roomNames` to have keys and their index.
export function createRooms(classroomsCount) {
  const rooms = _.range(0, classroomsCount).map((roomName, roomIndex) => {
    return {
      roomName: `Room ${String.fromCharCode(65 + roomIndex)}`,
      roomIndex,
      roomKey: roomKeyFromIndex(roomIndex)
    };
  });

  return [{
    roomName: 'Not placed',
    roomIndex: rooms.length,
    roomKey: UNPLACED_ROOM_KEY
  }].concat(rooms);
}

export function areAllStudentsPlaced(studentIdsByRoom) {
  return (studentIdsByRoom[UNPLACED_ROOM_KEY].length > 0);
}

export function studentsInRoom(students, studentIdsByRoom, roomKey) {
  const studentIds = studentIdsByRoom[roomKey] || [];
  return studentIds.map(studentId => _.find(students, { id: studentId }));
}