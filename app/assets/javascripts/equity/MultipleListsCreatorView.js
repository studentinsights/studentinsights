import React from 'react';
import _ from 'lodash';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import SimpleStudentCard from './SimpleStudentCard';





const styles = {
  listsContainer: {
    display: 'flex'
  },
  classroomListColumn: {
    padding: 20,
    paddingTop: 0,
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  }
  // students: {
  //   padding: 20,
  //   paddingTop: 0,
  //   display: 'flex',
  //   flex: 1,
  //   flexDirection: 'column'
  // },
  // links: {
  //   fontSize: 12,
  //   paddingLeft: 10
  // },
  // link: {
  //   display: 'inline-block',
  //   padding: 5,
  //   fontSize: 12,
  //   color: '#3177c9'
  // },
  // selectedLink: {
  //   border: '1px solid #3177c9'
  // },
  // studentsGrid: {
  //   flex: 1,
  //   overflowY: 'scroll',
  //   overflowX: 'hidden',
  //   border: '1px solid #ccc'
  //   /* backgroundColor: 'rgba(243, 136, 42, 0.18)' */
  // },
  // indicator: {
  //   fontSize: 12
  // },
  // column: {
  //   width: width,
  //   backgroundColor: '#eee',
  //   border: '1px solid #ccc',
  //   borderBottom: 0,
  //   padding: 10
  // },
  // listStyle: {
  //   backgroundColor: '#eee',
  //   border: '1px solid #ccc',
  //   height: 180,
  //   width: width
  // },
  // itemStyle: {
  //   userSelect: 'none'
  // },
  // leftListStyle: {
  //   width: width
  // }
};

function initialClassroomLists(roomsCount) {
  return _.range(0, roomsCount).map(index => []);
}

export class MultipleListsCreatorView extends React.Component {
  constructor(props) {
    super(props);

    const {rooms} = props;
    this.state = {
      classroomLists: initialClassroomLists(rooms.length),
      sortKey: 'not-yet-placed',
    };

    // this.onResetClicked = this.onResetClicked.bind(this);
  }

  // studentsInRoom(room) {
  //   const {students, rooms} = this.props;
  //   const {slots} = this.state;
  //   const roomIndex = rooms.indexOf(room);
  //   const slotForRoom = roomIndex;
  //   return students.filter(student => slots[student.id] === slotForRoom);
  // }

  // sortedStudents() {
  //   const {students, rooms} = this.props;
  //   const {slots, sortKey} = this.state;

  //   return _.sortBy(students, (student, index) => {
  //     if (sortKey === 'not-yet-placed') {
  //       return slots[student.id];
  //     } else if (sortKey === 'classroom') {
  //       return slots[student.id];
  //     } else if (sortKey === 'alphabetical') {
  //       return student.last_name + ' ' + student.first_name;
  //     }
  //     return index;
  //   });
  // }

  // onResetClicked() {
  //   const {students, rooms} = this.props;
  //   const slots = students.reduce((map, student) => {
  //     return {
  //       ...map,
  //       [student.id]: rooms.length - 1
  //     };
  //   }, {});
  //   this.setState({slots});
  // }

  // onSortClicked(sortKey) {
  //   // scrollTop?
  //   this.setState({sortKey});
  // }

  // onDragStop(student, e, data) {
  //   e.preventDefault();
  //   e.stopPropagation();

  //   const {x} = data;
  //   const {slots} = this.state;
  //   const slot = Math.floor(x / width);
  //   this.setState({
  //     slots: {
  //       ...slots,
  //       [student.id]: slot
  //     }
  //   });
  //   this.forceUpdate(); // TODO(kr) hacking draggable
  // }

  render() {
    const {rooms, students} = this.props;
    const {classroomLists} = this.state;
    const placedStudentIds = _.flatten(classroomLists);
    const unplacedStudents = students.filter(student => {
      return placedStudentIds.indexOf(student.id) === -1;
    });
    // const sortedStudents = this.sortedStudents();

    return (
      <div className="MultipleListsCreatorView" style={styles.content}>
        <div style={styles.listsContainer}>
          {rooms.map((room, roomIndex) => {
            const classroomStudents = classroomLists[roomIndex].map(studentId => {
              return _.find(students, { id: studentId });
            });
            return (
              <div key={roomIndex} style={styles.classroomListColumn}>
                <div>{room}</div>
                <div>...stats...</div>
                <div>{classroomStudents.map(this.renderStudentCard, this)}</div>
              </div>
            );
          })}
          <div key="unplaced" style={styles.classroomListColumn}>
            <div>Not yet placed</div>
            <div>{unplacedStudents.map(this.renderStudentCard, this)}</div>
          </div>
        </div>
      </div>
    );
  }

  renderStudentCard(student) {
    return <SimpleStudentCard key={student.id} student={student} />;
  }

  // renderSortLink(sortKey, text) {
  //   const style = {
  //     ...styles.link,
  //     ...(sortKey === this.state.sortKey ? styles.selectedLink : {})
  //   };
  //   return <a onClick={this.onSortClicked.bind(this, sortKey)} style={style}>{text}</a>;
  // }

  // /*
  // high academic, low academic
  // disabilities
  // language

  // high discipline, low discipline

  // gender
  // race
  // ethnicity
  // free/reduced lunch
  // */
  // renderRoom(room, slotForRoom) {
  //   const {rooms} = this.props;
  //   const studentsInRooms = rooms.map(this.studentsInRoom, this);
  //   const studentsInRoom = studentsInRooms[slotForRoom];
  //   const containerStyle = (slotForRoom === rooms.length)
  //     ? styles.column
  //     : {...styles.column, borderRight: 0};
  //   return (
  //     <div key={room} style={containerStyle}>
  //       <h2>{room}</h2>
  //       <div style={styles.indicator}>Students: {studentsInRoom.length}</div>
  //       <div style={styles.indicator}>{'\u00A0'}</div>
  //       <div style={styles.indicator}>{this.renderLowIncome(studentsInRooms, slotForRoom)}</div>
  //       <div style={styles.indicator}>{this.renderELL(studentsInRooms, slotForRoom)}</div>
  //       <div style={styles.indicator}>{this.renderSPED(studentsInRooms, slotForRoom)}</div>
  //       <div style={styles.indicator}>{this.renderMath(studentsInRooms, slotForRoom)}</div>
  //       <div style={styles.indicator}>{this.renderReading(studentsInRooms, slotForRoom)}</div>
  //     </div>
  //   );
  // }

  // // TODO(kr) PerDistrict
  // renderLowIncome(studentsInRooms, slotForRoom) {
  //   const percentageInRooms = studentsInRooms.map(students => {
  //     const count = students.filter(s => -1 !== ['Free Lunch', 'Reduced Lunch'].indexOf(s.free_reduced_lunch)).length;
  //     return count === 0 ? 0 : Math.round(100 * count / students.length);
  //   });
  //   return this.renderOutlier('Language', percentageInRooms, percentageInRooms[slotForRoom]);

  //   // with bar
  //   // const percentageInRooms = studentsInRooms.map(students => {
  //   //   const count = students.filter(s => -1 !== ['Free Lunch', 'Reduced Lunch'].indexOf(s.free_reduced_lunch)).length;
  //   //   return count === 0 ? 0 : Math.round(100 * count / students.length);
  //   // });
  //   // const percent = percentageInRooms[slotForRoom];
  //   // return (
  //   //   <div>
  //   //     <div>Language</div>
  //   //     <Bar percent={percent} threshold={10} styles={{paddingLeft: 20, paddingRight: 20, background: '#ccc', border: '#999', height: 12, width: 100 }} />
  //   //   </div>
  //   // );
  // }

  // // TODO(kr) PerDistrict
  // renderELL(studentsInRooms, slotForRoom) {
  //   const percentageInRooms = studentsInRooms.map(students => {
  //     const count = students.filter(s => -1 !== ['Fluent'].indexOf(s.limited_english_proficiency)).length;
  //     return count === 0 ? 0 : Math.round(100 * count / students.length);
  //   });
  //   return this.renderOutlier('Learning English', percentageInRooms, percentageInRooms[slotForRoom]);
  // }

  // // TODO(kr) PerDistrict
  // renderSPED(studentsInRooms, slotForRoom) {
  //   const percentageInRooms = studentsInRooms.map(students => {
  //     const count = students.filter(s => s.disability !== null).length;
  //     return count === 0 ? 0 : Math.round(100 * count / students.length);
  //   });
  //   return this.renderOutlier('Disability', percentageInRooms, percentageInRooms[slotForRoom]);
  // }

  // renderMath(studentsInRooms, slotForRoom) {
  //   return this.renderStar(studentsInRooms, slotForRoom, 'STAR Math', student => student.most_recent_star_math_percentile);
  // }

  // renderReading(studentsInRooms, slotForRoom) {
  //   return this.renderStar(studentsInRooms, slotForRoom, 'STAR Reading', student => student.most_recent_star_reading_percentile);
  // }

  // renderStar(studentsInRooms, slotForRoom, text, accessor) {
  //   const valuesForRooms = studentsInRooms.map(students => {
  //     return _.compact(students.map(accessor));
  //   });
  //   const values = valuesForRooms[slotForRoom];
  //   return (
  //     <div>
  //       <div>{text}</div>
  //       {(values.length === 0)
  //         ? <div style={{height: 30}}>{'\u00A0'}</div>
  //         : <BoxAndWhisker values={values} style={{width: 100, marginLeft: 'auto', marginRight: 'auto'}} />}
  //     </div>
  //   );
  // }

  // renderOutlier(text, byRooms, value) {
  //   const diffByRooms = byRooms.map(byRoom => byRoom - value);
  //   const maxDiff = _.max(diffByRooms, Math.abs);
  //   return (maxDiff > 0.10)
  //       ? <span style={{color: 'orange'}}>{text}: {value}%</span>
  //       : <span style={{color: '#ccc'}}>{text}: {value}%</span>;
  // }

  // renderFiller(key, style) {
  //   return <div style={style} key={key}>{key}</div>;
  // }

  // renderValue(text, value) {
  //   return (value > 80)
  //     ? <span style={{color: '#3177c9'}}>{text}: {value}%</span>
  //     : <span style={{color: '#ccc'}}>{text}: {value}%</span>;
  // }
}
MultipleListsCreatorView.propTypes = {
  rooms: React.PropTypes.array.isRequired,
  students: React.PropTypes.array.isRequired
};



export default DragDropContext(HTML5Backend)(MultipleListsCreatorView);
