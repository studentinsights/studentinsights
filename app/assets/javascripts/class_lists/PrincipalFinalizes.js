import React from 'react';
import _ from 'lodash';

export default class PrincipalFinalizes extends React.Component {
  render() {
    return 'todo';
    // const {
    //   students,
    //   classroomsCount,
    //   studentIdsByRoom,
    //   gradeLevelNextYear,
    //   isExpandedVertically,
    //   onExpandVerticallyToggled
    // } = this.props;
    // const {highlightKey} = this.state;
    // const rooms = createRooms(classroomsCount);

    // return (
    //   <div className="PrincipalFinalizes" style={styles.root}>
    //     <div style={styles.expandLink} onClick={onExpandVerticallyToggled}>
    //       {isExpandedVertically ? '▴ Collapse ▴' : '▾ Expand ▾'}
    //     </div>
    //     <ClassroomStats
    //       students={students}
    //       gradeLevelNextYear={gradeLevelNextYear}
    //       rooms={rooms.filter(room => room.roomKey !== UNPLACED_ROOM_KEY)}
    //       studentIdsByRoom={studentIdsByRoom}
    //       highlightKey={highlightKey}
    //       onCategorySelected={this.onCategorySelected}/>
    //     {this.renderLists(rooms)}
    //   </div>
    // );
  }

  renderDownloadListsLink() {
    const {gradeLevelNextYear, schoolId, schools, students, studentIdsByRoom} = this.props;
    const gradeLevel = gradeText(gradeLevelNextYear);
    const schoolName = _.find(schools, {id: schoolId}).name;
    const dateText = moment.utc().format('YYYY-MM-DD');
    const filename = `Class list: ${gradeLevel} at ${schoolName} ${dateText}.csv`;

    const rows = _.flatten(Object.keys(studentIdsByRoom).map(roomKey => {
      return studentIdsByRoom[roomKey].map(studentId => {
        const student = _.find(students, {id: studentId});
        return [
          `${student.first_name} ${student.last_name}`,
          student.date_of_birth,
          roomKey
        ];
      });
    }));
    const header = 'Student name,LASID,Room next year';
    const csvText = [header].concat(rows).join('\n');
    return (
      <DownloadCsvLink
        filename={filename}
        csvText={csvText}
        style={{paddingLeft: 20, fontSize: styles.fontSize}}>
        Download for Excel
      </DownloadCsvLink>
    );
  }
}
PrincipalFinalizes.propTypes = {
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
