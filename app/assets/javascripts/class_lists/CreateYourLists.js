import React from 'react';
import _ from 'lodash';
import {AutoSizer} from 'react-virtualized';
import SimpleStudentCard from './SimpleStudentCard';
import ClassroomStats from './ClassroomStats';
import {studentsInRoom} from './studentIdsByRoomFunctions';
import {DragDropContext, Droppable} from 'react-beautiful-dnd';
import {
  reordered,
  insertedInto,
  UNPLACED_ROOM_KEY,
  createRooms
} from './studentIdsByRoomFunctions';


// This is the main UI for creating classroom lists.  It shows cards for each student,
// lets the user drag them around to different classroom lists, shows summary statistics
// comparing each room, and lets users click on students to see more.
export default class CreateYourListsView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      highlightFn: null
    };
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onHighlightFn = this.onHighlightFn.bind(this);
  }

  onDragEnd(dragEndResult) {
    const {onClassListsChanged, studentIdsByRoom} = this.props;
    const updatedStudentIdsByRoom = studentIdsByRoomAfterDrag(studentIdsByRoom, dragEndResult);
    onClassListsChanged(updatedStudentIdsByRoom);
  }

  onHighlightFn(highlightFn) {
    this.setState({highlightFn});
  }

  render() {
    const {
      isEditable,
      students,
      classroomsCount,
      studentIdsByRoom,
      gradeLevelNextYear
    } = this.props;
    const rooms = createRooms(classroomsCount);

    return (
      <div className="CreateYourListsView" style={styles.root}>
        <ClassroomStats
          students={students}
          gradeLevelNextYear={gradeLevelNextYear}
          rooms={rooms.filter(room => room.roomKey !== UNPLACED_ROOM_KEY)}
          studentIdsByRoom={studentIdsByRoom}
          onHighlightFn={this.onHighlightFn}/>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <div style={styles.listsContainer}>
            {rooms.map(room => {
              const {roomKey, roomName} = room;
              const classroomStudents = studentsInRoom(students, studentIdsByRoom, roomKey);
              return (
                <div key={roomKey} style={styles.classroomListColumn}>
                  <div>
                    <div style={styles.roomTitle}>
                      <span style={{fontWeight: 'bold'}}>{roomName}</span>
                      <span style={styles.roomStudentCount}>({classroomStudents.length})</span>
                    </div>
                  </div>
                  <div style={{flex: 1}}>
                    <AutoSizer disableWidth>{({height}) => (
                      <Droppable
                        droppableId={roomKey}
                        type="CLASSROOM_LIST"
                        isDropDisabled={!isEditable}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} style={{...styles.droppable, height}}>
                            <div>{classroomStudents.map(this.renderStudentCard, this)}</div>
                            <div>{provided.placeholder}</div>
                          </div>
                        )}
                      </Droppable>
                    )}</AutoSizer>
                  </div>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    );
  }

  renderStudentCard(student, index) {
    const {fetchProfile, isEditable} = this.props;
    const {highlightFn} = this.state;
    return <SimpleStudentCard
      key={student.id}
      highlightFn={highlightFn}
      student={student}
      index={index}
      fetchProfile={fetchProfile}
      isEditable={isEditable} />;
  }
}
CreateYourListsView.propTypes = {
  isEditable: React.PropTypes.bool.isRequired,
  classroomsCount: React.PropTypes.number.isRequired,
  gradeLevelNextYear: React.PropTypes.string.isRequired,
  students: React.PropTypes.array.isRequired,
  studentIdsByRoom: React.PropTypes.object.isRequired,
  fetchProfile: React.PropTypes.func.isRequired,
  onClassListsChanged: React.PropTypes.func.isRequired
};


// Update the `studentIdsByRoom` map after a drag ends.
export function studentIdsByRoomAfterDrag(studentIdsByRoom, dragEndResult) {
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


const styles = {
  root: {
    userSelect: 'none',
    msUserSelect: 'none',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  listsContainer: {
    display: 'flex',
    flex: 1
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
    minHeight: 150,
    overflowY: 'scroll'
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
  },
  roomStudentCount: {
    float: 'right',
    color: '#666',
    fontSize: 12
  }
};
