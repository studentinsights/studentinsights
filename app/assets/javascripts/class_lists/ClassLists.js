import React from 'react';
import _ from 'lodash';
import {AutoSizer} from 'react-virtualized';
import StudentCard from './StudentCard';
import ClassroomStats from './ClassroomStats';
import {studentsInRoom} from './studentIdsByRoomFunctions';
import {DragDropContext, Droppable} from 'react-beautiful-dnd';


// Visual UI component for rendering lists of students in classrooms.
export default class ClassLists extends React.Component {

  render() {
    const {
      isEditable,
      students,
      studentIdsByRoom,
      isExpandedVertically,
      onRoomNameClicked,
      onExpandVerticallyToggled,
      onDragEnd,
      rooms
    } = this.props;

    const expandedStyles = isExpandedVertically ? { height: '90em' } : { flex: 1 }; // estimating 30 students with 3em per card
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{...styles.listsContainer, ...expandedStyles}}>
          {rooms.map(room => {
            const {roomKey, roomName} = room;
            const classroomStudents = studentsInRoom(students, studentIdsByRoom, roomKey);
            return (
              <div key={roomKey} style={styles.classroomListColumn}>
                <div>
                  <div style={styles.roomTitle}>
                    <span style={{fontWeight: 'bold'}} onClick={onRoomNameClicked && onRoomNameClicked.bind(room)}>
                      {roomName}
                    </span>
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
    );
  }

  renderStudentCard(student, index) {
    const {fetchProfile, isEditable, highlightKey} = this.props;
    return <StudentCard
      key={student.id}
      highlightKey={highlightKey}
      student={student}
      index={index}
      fetchProfile={fetchProfile}
      isEditable={isEditable} />;
  }
}
ClassLists.propTypes = {
  isEditable: React.PropTypes.bool.isRequired,
  isExpandedVertically: React.PropTypes.bool.isRequired,
  highlightKey: React.PropTypes.string,
  rooms: React.PropTypes.array.isRequired,
  students: React.PropTypes.array.isRequired,
  studentIdsByRoom: React.PropTypes.object.isRequired,
  fetchProfile: React.PropTypes.func.isRequired,

  onClassListsChanged: React.PropTypes.func,
  onExpandVerticallyToggled: React.PropTypes.func,
  onDragEnd: React.PropTypes.func,
  onRoomNameClicked: React.PropTypes.func,
};


const styles = {
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
