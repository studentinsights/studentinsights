import React from 'react';
import _ from 'lodash';
import ClassroomStats from './ClassroomStats';
import ClassLists from './ClassLists';
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
      highlightKey: null
    };
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onCategorySelected = this.onCategorySelected.bind(this);
  }

  onDragEnd(dragEndResult) {
    const {onClassListsChanged, studentIdsByRoom} = this.props;
    const updatedStudentIdsByRoom = studentIdsByRoomAfterDrag(studentIdsByRoom, dragEndResult);
    onClassListsChanged(updatedStudentIdsByRoom);
  }

  onCategorySelected(highlightKey) {
    this.setState({highlightKey});
  }

  render() {
    const {
      students,
      classroomsCount,
      studentIdsByRoom,
      gradeLevelNextYear,
      isExpandedVertically,
      onExpandVerticallyToggled
    } = this.props;
    const {highlightKey} = this.state;
    const rooms = createRooms(classroomsCount);

    return (
      <div className="CreateYourListsView" style={styles.root}>
        <div style={styles.expandLink} onClick={onExpandVerticallyToggled}>
          {isExpandedVertically ? '▴ Collapse ▴' : '▾ Expand ▾'}
        </div>
        <ClassroomStats
          students={students}
          gradeLevelNextYear={gradeLevelNextYear}
          rooms={rooms.filter(room => room.roomKey !== UNPLACED_ROOM_KEY)}
          studentIdsByRoom={studentIdsByRoom}
          highlightKey={highlightKey}
          onCategorySelected={this.onCategorySelected}/>
        {this.renderLists(rooms)}
      </div>
    );
  }

  renderLists(rooms) {
    const {
      isEditable,
      students,
      studentIdsByRoom,
      isExpandedVertically,
      fetchProfile,
      onClassListsChanged,
      onExpandVerticallyToggled
    } = this.props;
    const {highlightKey} = this.state;
    return (
      <ClassLists
        highlightKey={highlightKey}
        isEditable={isEditable}
        students={students}
        studentIdsByRoom={studentIdsByRoom}
        isExpandedVertically={isExpandedVertically}
        rooms={rooms}
        fetchProfile={fetchProfile}
        onDragEnd={this.onDragEnd}
        onClassListsChanged={onClassListsChanged}
        onExpandVerticallyToggled={onExpandVerticallyToggled}
      />
    );
  }
}
CreateYourListsView.propTypes = {
  isEditable: React.PropTypes.bool.isRequired,
  isExpandedVertically: React.PropTypes.bool.isRequired,
  classroomsCount: React.PropTypes.number.isRequired,
  gradeLevelNextYear: React.PropTypes.string.isRequired,
  students: React.PropTypes.array.isRequired,
  studentIdsByRoom: React.PropTypes.object.isRequired,
  fetchProfile: React.PropTypes.func.isRequired,
  onClassListsChanged: React.PropTypes.func.isRequired,
  onExpandVerticallyToggled: React.PropTypes.func.isRequired,
};


// Update the `studentIdsByRoom` map after a drag ends.
export function studentIdsByRoomAfterDrag(studentIdsByRoom, dragEndResult) {
  const {draggableId, source, destination} = dragEndResult;

  // Not moved
  if (destination === null) return studentIdsByRoom;

  const sourceStudentIds = studentIdsByRoom[source.droppableId];
  const destinationStudentIds = studentIdsByRoom[destination.droppableId];
  const draggableStudentId = _.find(sourceStudentIds, studentId => `StudentCard:${studentId}` === draggableId);

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
    height: '100%',
    position: 'relative' // for expandLink
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
  },
  expandLink: {
    position: 'absolute',
    padding: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
    bottom: -20,
    cursor: 'pointer'
  }
};
