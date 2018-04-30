import React from 'react';
import _ from 'lodash';
import SimpleStudentCard from './SimpleStudentCard';
import ClassroomStats from './ClassroomStats';
import {DragDropContext, Droppable} from 'react-beautiful-dnd';
import {reordered, insertedInto, UNPLACED_ROOM_KEY} from './studentIdsByRoomFunctions';


// This is the main UI for creating classroom lists.  It shows cards for each student,
// lets the user drag them around to different classroom lists, shows summary statistics
// comparing each room, and lets users click on students to see more.
export default class CreateYourClassroomsView extends React.Component {
  constructor(props) {
    super(props);

    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onDragEnd(dragEndResult) {
    const {onClassroomListsChanged, studentIdsByRoom} = this.props;
    const updatedStudentIdsByRoom = studentIdsByRoomAfterDrag(studentIdsByRoom, dragEndResult);
    onClassroomListsChanged(updatedStudentIdsByRoom);
  }

  render() {
    const {students, classroomsCount, studentIdsByRoom} = this.props;
    const rooms = this.rooms(classroomsCount);

    return (
      <div className="CreateYourClassroomsView" style={styles.root}>
        <ClassroomStats
          students={students}
          rooms={rooms.filter(room => room.roomKey !== UNPLACED_ROOM_KEY)}
          studentIdsByRoom={studentIdsByRoom} />
        <DragDropContext onDragEnd={this.onDragEnd}>
          <div style={styles.listsContainer}>
            {rooms.map(room => {
              const {roomKey, roomName} = room;
              const classroomStudents = studentIdsByRoom[roomKey].map(studentId => {
                return _.find(students, { id: studentId });
              });
              return (
                <div key={roomKey} style={styles.classroomListColumn}>
                  <div>
                    <div style={styles.roomTitle}>
                      <span style={{fontWeight: 'bold'}}>{roomName}</span>
                      <span style={{float: 'right', color: '#666', fontSize: 12}}>({classroomStudents.length})</span>
                    </div>
                  </div>
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
  students: React.PropTypes.array.isRequired,
  studentIdsByRoom: React.PropTypes.object.isRequired,
  onClassroomListsChanged: React.PropTypes.func.isRequired
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
    paddingLeft: 10,
    paddingRight: 10,
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
  },
  roomTitle: {
    border: '1px solid #aaa',
    borderBottom: 0,
    background: '#aaa',
    borderRadius: 3,
    fontSize: 14,
    padding: 10,
    // to place this over the rounded border right below
    position: 'relative',
    top: 3
  }
};



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
