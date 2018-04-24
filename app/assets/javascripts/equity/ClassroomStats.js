import React from 'react';
import _ from 'lodash';
import Bar from '../components/Bar';
import BoxAndWhisker from '../components/BoxAndWhisker';


const styles = {
  table: {
    width: '100%',
    textAlign: 'left',
    fontSize: 12,
    borderBottom: '1px solid #eee',
    padding: 20,
    tableLayout: 'fixed'
  },
  cell: {

  }
};
export default class ClassroomStats extends React.Component {
  studentsInRoom(room) {
    const {students, studentIdsByRoom} = this.props;
    return studentIdsByRoom[room.roomKey].map(studentId => {
      return _.find(students, { id: studentId });
    });
  }

  render() {
    const {rooms} = this.props;
    return (
      <div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th></th>
              <th>Gender (female)</th>
              <th>Low income</th>
              <th>Disability</th>
              <th>Learning English</th>
              <th>STAR Math</th>
              <th>STAR Reading</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => {  
              return (
                <tr key={room.roomKey}>
                  <td style={{...styles.cell, fontWeight: 'bold'}}>{room.roomName}</td>
                  <td style={styles.cell}>{this.renderGender(room)}</td>
                  <td style={styles.cell}>{this.renderLowIncome(room)}</td>
                  <td style={styles.cell}>{this.renderDisability(room)}</td>
                  <td style={styles.cell}>{this.renderEnglishLearners(room)}</td>
                  <td style={styles.cell}>{this.renderMath(room)}</td>
                  <td style={styles.cell}>{this.renderReading(room)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  renderMath(room) {
    return this.renderStar(room, student => student.most_recent_star_math_percentile);
  }

  renderReading(room) {
    return this.renderStar(room, student => student.most_recent_star_reading_percentile);
  }

  renderStar(room, accessor) {
    const students = this.studentsInRoom(room);
    const values = _.compact(students.map(accessor));
    return (
      <div>
        {(values.length === 0)
          ? <div style={{height: 30}}>{'\u00A0'}</div>
          : <BoxAndWhisker values={values} style={{width: 100, marginLeft: 'auto', marginRight: 'auto'}} />}
      </div>
    );
  }

  renderGender(room) {
    return this.renderBarFor(room, student => {
      return student.gender === 'F';
    });
  }

  // TODO(kr) PerDistrict
  renderLowIncome(room) {
    return this.renderBarFor(room, student => {
      return ['Free Lunch', 'Reduced Lunch'].indexOf(student.free_reduced_lunch) !== -1;
    });
  }

  renderDisability(room) {
    return this.renderBarFor(room, student => student.disability !== null);
  }

  renderEnglishLearners(room) {
    return this.renderBarFor(room, student => student.limited_english_proficiency !== 'Fluent');
  }

  renderBarFor(room, filterFn) {
    const students = this.studentsInRoom(room);
    const count = students.filter(filterFn).length;
    const percent = count === 0
      ? 0 
      : Math.round(100 * count / students.length);

    return (
      <Bar
        percent={percent}
        threshold={5}
        style={{background: 'white', fontSize: 10, borderBottom: '1px solid #333'}}
        innerStyle={{justifyContent: 'flex-start', padding: 2, color: '#999'}} />
    );
  }
}
ClassroomStats.propTypes = {
  students: React.PropTypes.array.isRequired,
  rooms: React.PropTypes.array.isRequired,
  studentIdsByRoom: React.PropTypes.object.isRequired
};



// import MultipleListsCreatorView from './MultipleListsCreatorView';

// export default class ClassroomListsCreatorView extends React.Component {
//   constructor(props) {
//     super(props);

//     this.onResetClicked = this.onResetClicked.bind(this);
//   }

//   studentsInRoom(room) {
//     const {students, rooms} = this.props;
//     const {slots} = this.state;
//     const roomIndex = rooms.indexOf(room);
//     const slotForRoom = roomIndex;
//     return students.filter(student => slots[student.id] === slotForRoom);
//   }

//   sortedStudents() {
//     const {students, rooms} = this.props;
//     const {slots, sortKey} = this.state;

//     return _.sortBy(students, (student, index) => {
//       if (sortKey === 'not-yet-placed') {
//         return slots[student.id];
//       } else if (sortKey === 'classroom') {
//         return slots[student.id];
//       } else if (sortKey === 'alphabetical') {
//         return student.last_name + ' ' + student.first_name;
//       }
//       return index;
//     });
//   }

//   onResetClicked() {
//     const {students, rooms} = this.props;
//     const slots = students.reduce((map, student) => {
//       return {
//         ...map,
//         [student.id]: rooms.length - 1
//       };
//     }, {});
//     this.setState({slots});
//   }

//   onSortClicked(sortKey) {
//     // scrollTop?
//     this.setState({sortKey});
//   }

//   onDragStop(student, e, data) {
//     e.preventDefault();
//     e.stopPropagation();

//     const {x} = data;
//     const {slots} = this.state;
//     const slot = Math.floor(x / width);
//     this.setState({
//       slots: {
//         ...slots,
//         [student.id]: slot
//       }
//     });
//     this.forceUpdate(); // TODO(kr) hacking draggable
//   }

//   render() {
//     const {rooms, communityName, students} = this.props;
//     const {slots} = this.state;
//     const sortedStudents = this.sortedStudents();

//     return (
//       <div style={styles.content}>
//         <div style={styles.classrooms}>
//           <div style={{display: 'flex', justifyContent: 'space-between'}}>
//             <div style={styles.links}>
//               Sort by:
//               {this.renderSortLink('classroom', 'classroom')}
//               {this.renderSortLink('alphabetical', 'alphabetical')}
//             </div>
//             {/*<div style={styles.links}>
//               Actions:
//               <a onClick={this.onResetClicked} style={styles.link}>reset to blank</a>
//               <a style={styles.link}>randomly assign not yet placed</a>
//             </div>*/}
//           </div>
//           <div style={styles.listsContainer}>
//             {rooms.map((room, index) => this.renderRoom(room, index))}
//             <div key="unplaced" style={{...styles.column, borderRight: 0, width: 'auto', flex: 1}}>
//               <h2>Not yet placed</h2>
//               <div style={styles.indicator}>Students left to place: {sortedStudents.length}</div>
//             </div>
//           </div>
//         </div>
//         <div style={styles.students}>
//           <div style={styles.studentsGrid}>
//             {sortedStudents.map(student => {
//               const slot = slots[student.id];

//               // TODO(kr) calling setState in onStop doesn't work with
//               // updated defaultPosition.  This means "action" links don't work.
//               // <Draggable /> requires a <div /> to be the child.
//               return (
//                 <Draggable
//                   key={student.id}
//                   axis="x"
//                   position={{x: width * slot, y: 0}}
//                   grid={[width, 0]}
//                   onStop={this.onDragStop.bind(this, student)}>
//                   <div>
//                    <StudentCard
//                     student={student}
//                     width={width} />
//                   </div>
//                 </Draggable>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   renderSortLink(sortKey, text) {
//     const style = {
//       ...styles.link,
//       ...(sortKey === this.state.sortKey ? styles.selectedLink : {})
//     };
//     return <a onClick={this.onSortClicked.bind(this, sortKey)} style={style}>{text}</a>;
//   }

//   /*
//   high academic, low academic
//   disabilities
//   language

//   high discipline, low discipline

//   gender
//   race
//   ethnicity
//   free/reduced lunch
//   */
//   renderRoom(room, slotForRoom) {
//     const {rooms} = this.props;
//     const studentsInRooms = rooms.map(this.studentsInRoom, this);
//     const studentsInRoom = studentsInRooms[slotForRoom];
//     const containerStyle = (slotForRoom === rooms.length)
//       ? styles.column
//       : {...styles.column, borderRight: 0};
//     return (
//       <div key={room} style={containerStyle}>
//         <h2>{room}</h2>
//         <div style={styles.indicator}>Students: {studentsInRoom.length}</div>
//         <div style={styles.indicator}>{'\u00A0'}</div>
//         <div style={styles.indicator}>{this.renderLowIncome(studentsInRooms, slotForRoom)}</div>
//         <div style={styles.indicator}>{this.renderELL(studentsInRooms, slotForRoom)}</div>
//         <div style={styles.indicator}>{this.renderSPED(studentsInRooms, slotForRoom)}</div>
//         <div style={styles.indicator}>{this.renderMath(studentsInRooms, slotForRoom)}</div>
//         <div style={styles.indicator}>{this.renderReading(studentsInRooms, slotForRoom)}</div>
//       </div>
//     );
//   }

//   // TODO(kr) PerDistrict
//   renderLowIncome(studentsInRooms, slotForRoom) {
//     const percentageInRooms = studentsInRooms.map(students => {
//       const count = students.filter(s => -1 !== ['Free Lunch', 'Reduced Lunch'].indexOf(s.free_reduced_lunch)).length;
//       return count === 0 ? 0 : Math.round(100 * count / students.length);
//     });
//     return this.renderOutlier('Language', percentageInRooms, percentageInRooms[slotForRoom]);

//     // with bar
//     // const percentageInRooms = studentsInRooms.map(students => {
//     //   const count = students.filter(s => -1 !== ['Free Lunch', 'Reduced Lunch'].indexOf(s.free_reduced_lunch)).length;
//     //   return count === 0 ? 0 : Math.round(100 * count / students.length);
//     // });
//     // const percent = percentageInRooms[slotForRoom];
//     // return (
//     //   <div>
//     //     <div>Language</div>
//     //     <Bar percent={percent} threshold={10} styles={{paddingLeft: 20, paddingRight: 20, background: '#ccc', border: '#999', height: 12, width: 100 }} />
//     //   </div>
//     // );
//   }

//   // TODO(kr) PerDistrict
//   renderELL(studentsInRooms, slotForRoom) {
//     const percentageInRooms = studentsInRooms.map(students => {
//       const count = students.filter(s => -1 !== ['Fluent'].indexOf(s.limited_english_proficiency)).length;
//       return count === 0 ? 0 : Math.round(100 * count / students.length);
//     });
//     return this.renderOutlier('Learning English', percentageInRooms, percentageInRooms[slotForRoom]);
//   }

//   // TODO(kr) PerDistrict
//   renderSPED(studentsInRooms, slotForRoom) {
//     const percentageInRooms = studentsInRooms.map(students => {
//       const count = students.filter(s => s.disability !== null).length;
//       return count === 0 ? 0 : Math.round(100 * count / students.length);
//     });
//     return this.renderOutlier('Disability', percentageInRooms, percentageInRooms[slotForRoom]);
//   }

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

//   renderOutlier(text, byRooms, value) {
//     const diffByRooms = byRooms.map(byRoom => byRoom - value);
//     const maxDiff = _.max(diffByRooms, Math.abs);
//     return (maxDiff > 0.10)
//         ? <span style={{color: 'orange'}}>{text}: {value}%</span>
//         : <span style={{color: '#ccc'}}>{text}: {value}%</span>;
//   }

//   renderFiller(key, style) {
//     return <div style={style} key={key}>{key}</div>;
//   }

//   renderValue(text, value) {
//     return (value > 80)
//       ? <span style={{color: '#3177c9'}}>{text}: {value}%</span>
//       : <span style={{color: '#ccc'}}>{text}: {value}%</span>;
//   }
// }
// ClassroomListsCreatorView.propTypes = {
//   communityName: React.PropTypes.string.isRequired,
//   rooms: React.PropTypes.array.isRequired,
//   students: React.PropTypes.array.isRequired
// };


//   // content: {
//   //   display: 'flex',
//   //   flex: 1,
//   //   flexDirection: 'column'
//   // },
//   // sectionHeading: {
//   //   paddingLeft: 10,
//   //   paddingRight: 10,
//   //   paddingBottom: 10,
//   //   paddingTop: 0
//   // }
//   // classrooms: {
//   //   padding: 10,
//   //   paddingBottom: 0
//   // },
//   // listsContainer: {
//   //   display: 'flex',
//   //   margin: 10,
//   //   marginBottom: 0,
//   //   borderBottom: '1px solid black'
//   // },
//   // students: {
//   //   padding: 20,
//   //   paddingTop: 0,
//   //   display: 'flex',
//   //   flex: 1,
//   //   flexDirection: 'column'
//   // },
//   // links: {
//   //   fontSize: 12,
//   //   paddingLeft: 10
//   // },
//   // link: {
//   //   display: 'inline-block',
//   //   padding: 5,
//   //   fontSize: 12,
//   //   color: '#3177c9'
//   // },
//   // selectedLink: {
//   //   border: '1px solid #3177c9'
//   // },
//   // studentsGrid: {
//   //   flex: 1,
//   //   overflowY: 'scroll',
//   //   overflowX: 'hidden',
//   //   border: '1px solid #ccc'
//   //   /* backgroundColor: 'rgba(243, 136, 42, 0.18)' */
//   // },
//   // indicator: {
//   //   fontSize: 12
//   // }