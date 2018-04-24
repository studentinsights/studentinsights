import React from 'react';
import _ from 'lodash';
import SimpleStudentCard from './SimpleStudentCard';
import ClassroomStats from './ClassroomStats';
import {DragDropContext, Droppable} from 'react-beautiful-dnd';


export default class CreateYourClassroomsView extends React.Component {
  constructor(props) {
    super(props);

    const {classroomsCount, students} = props;
    this.state = {
      studentIdsByRoom: initialStudentIdsByRoom(classroomsCount, students),
      sortKey: 'not-yet-placed'
    };

    this.onDragEnd = this.onDragEnd.bind(this);
  }

  // TODO(kr) clarify the roomIndex / roomKey / null contract
  // Expand the `roomNames` to have keys and their index.
  rooms() {
    const {classroomsCount} = this.props;
    const rooms = _.range(0, classroomsCount).map((roomName, roomIndex) => {
      return {
        roomName: `Room ${String.fromCharCode(65 + roomIndex)}`,
        roomIndex,
        roomKey: roomKeyFromIndex(roomIndex)
      };
    });

    return rooms.concat([{
      roomName: 'Not yet placed',
      roomIndex: rooms.length,
      roomKey: roomKeyFromIndex(null)
    }]);
  }

  onDragEnd(dragEndResult) {
    const {studentIdsByRoom} = this.state;
    const updatedStudentIdsByRoom = studentIdsByRoomAfterDrag(studentIdsByRoom, dragEndResult);
    this.setState({studentIdsByRoom: updatedStudentIdsByRoom});
  }

  render() {
    const {students} = this.props;
    const {studentIdsByRoom} = this.state;
    const rooms = this.rooms();

    return (
      <div className="CreateYourClassroomsView" style={styles.root}>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <div style={styles.listsContainer}>
            {rooms.map(room => {
              const {roomKey, roomName} = room;
              const classroomStudents = studentIdsByRoom[roomKey].map(studentId => {
                return _.find(students, { id: studentId });
              });
              return (
                <div key={roomKey} style={styles.classroomListColumn}>
                  <ClassroomStats
                    roomName={roomName}
                    students={students}
                    rooms={rooms}
                    classroomStudents={classroomStudents} />
                  <Droppable droppableId={roomKey} type="CLASSROOM_LIST">
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} style={styles.droppable}>
                        <div>{classroomStudents.map(this.renderStudentCard, this)}</div>
                        <div>{provided.placeholder}</div>
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    );
  }

  renderStudentCard(student, index) {
    return <SimpleStudentCard key={student.id} student={student} index={index} />;
  }
}
CreateYourClassroomsView.propTypes = {
  classroomsCount: React.PropTypes.number.isRequired,
  students: React.PropTypes.array.isRequired
};

const styles = {
  root: {
    userSelect: 'none'
  },
  listsContainer: {
    display: 'flex'
  },
  classroomListColumn: {
    padding: 20,
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  droppable: {
    border: '1px solid #ccc',
    background: '#eee',
    padding: 3,
    borderRadius: 3,
    paddingTop: 10,
    paddingBottom: 10,
    minHeight: 150
  }
};

// Helper functions related to moving students around.
function roomKeyFromIndex(roomIndex) {
  return (roomIndex === null)
    ? 'room:unplaced'
    : `room:${roomIndex}`;
}

// {[roomKey]: [studentId]}
function initialStudentIdsByRoom(roomsCount, students) {
  const initialMap = {
    [roomKeyFromIndex(null)]: []
  };
  const studentIdsByRoom = _.range(0, roomsCount).reduce((map, roomIndex) => {
    return {
      ...map,
      [roomKeyFromIndex(roomIndex)]: []
    };
  }, initialMap);

  students.forEach(student => {
    const roomKey = _.sample(Object.keys(studentIdsByRoom));
    studentIdsByRoom[roomKey].push(student.id);
  });

  return studentIdsByRoom;
}


// Returns array with item inserted.
function insertedInto(items, insertIndex, itemToInsert) {
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

// Update the `studentIdsByRoom` map after a drag ends.
function studentIdsByRoomAfterDrag(studentIdsByRoom, dragEndResult) {
  const {draggableId, source, destination} = dragEndResult;

  // Not moved
  if (destination === null) return studentIdsByRoom;

  const sourceStudentIds = studentIdsByRoom[source.droppableId];
  const destinationStudentIds = studentIdsByRoom[destination.droppableId];
  const draggableStudentId = _.find(sourceStudentIds, studentId => `SimpleStudentCard:${studentId}` === draggableId);

  // Moving within the same list
  if (source.droppableId === destination.droppableId) {
    return {
      ...studentIdsByRoom,
      [source.droppableId]: reordered(sourceStudentIds, source.index, destination.index)
    };
  }

  // Moving to another list
  if (source.droppableId !== destination.droppableId) {
    return {
      ...studentIdsByRoom,
      [source.droppableId]: _.without(sourceStudentIds, draggableStudentId),
      [destination.droppableId]: insertedInto(destinationStudentIds, destination.index, draggableStudentId)
    };
  }
}
