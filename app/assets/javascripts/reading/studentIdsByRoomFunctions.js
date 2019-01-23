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

  const sortedStudents = _.sortBy(students, student => `${student.last_name}, ${student.first_name}`);
  sortedStudents.forEach(student => {
    const roomKey = (options.placementFn)
      ? options.placementFn(studentIdsByRoom, student)
      : UNPLACED_ROOM_KEY;

    studentIdsByRoom[roomKey].push(student.id);
  });

  return studentIdsByRoom;
}

// For testing and stories
export function consistentlyPlacedInitialStudentIdsByRoom(classroomsCount, students) {
  return initialStudentIdsByRoom(classroomsCount, students, {
    placementFn(studentIdsByRoom, student) {
      return roomKeyFromIndex(JSON.stringify(student).length % classroomsCount);
    }
  });
}

export const UNPLACED_ROOM_KEY = 'room:unplaced';

// Helper functions related to moving students around.
function roomKeyFromIndex(roomIndex) {
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
