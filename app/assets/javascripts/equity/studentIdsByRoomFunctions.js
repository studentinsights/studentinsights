import _ from 'lodash';


// Place the students into their initial state (eg, all unsorted).
// {[roomKey]: [studentId]}
export function initialStudentIdsByRoom(roomsCount, students) {
  const initialMap = {
    [UNPLACED_ROOM_KEY]: []
  };
  const studentIdsByRoom = _.range(0, roomsCount).reduce((map, roomIndex) => {
    return {
      ...map,
      [roomKeyFromIndex(roomIndex)]: []
    };
  }, initialMap);

  students.forEach(student => {
    // Random
    // const roomKey = _.sample(Object.keys(studentIdsByRoom));
    // studentIdsByRoom[roomKey].push(student.id);

    // All unassigned
    const roomKey = UNPLACED_ROOM_KEY;
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
  const result = Array.from(items);
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

// TODO(kr) clarify the roomIndex / roomKey / null contract
// Expand the `roomNames` to have keys and their index.
export function rooms(classroomsCount) {
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
