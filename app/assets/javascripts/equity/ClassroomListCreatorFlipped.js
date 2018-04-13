import React from 'react';
import _ from 'lodash';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import SectionHeading from '../components/SectionHeading';
import Bar from '../components/Bar';
import BoxAndWhisker from '../components/BoxAndWhisker';
import StudentCard from './StudentCard';
import {gradeText} from '../helpers/gradeText';
import Draggable from 'react-draggable';

const styles = {
  root: {},
  classroomsGrid: {
    flex: 3
  },
  unassignedList: {
    flex: 1
  },
  columns: {
    display: 'flex'
  }
};

// For grade-level teaching teams 
export default class ClassroomListCreatorFlipped extends React.Component {
  constructor(props) {
    super(props);

    this.fetchStudents = this.fetchStudents.bind(this);
    this.renderContent = this.renderContent.bind(this);
  }

  // TODO(KR) this wouldn't work for teacher authorization; this is just placeholder
  // TODO(KR) authorization is tricky since we're not using the same rules here.
  fetchStudents() {
    const {schoolId} = this.props;
    const url = `/schools/${schoolId}/overview_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="ClassroomListCreatorFlipped" style={styles.root}>
        <GenericLoader
          promiseFn={this.fetchStudents}
          render={this.renderContent} />
      </div>
    );
  }

  renderContent(json) {
    const {grade, educators} = this.props;
    const {students, school} = json;
    const rooms = [
      { id: 1, text: 'Room A' },
      { id: 2, text: 'Room B' },
      { id: 3, text: 'Room C' },
      { id: 4, text: 'Room D' },
      { id: 5, text: 'Room E' }
    ];
    const communityName = `${gradeText(grade)} at ${school.name}`;

    return (
      <ClassroomListCreatorFlippedView
        communityName={communityName}
        students={students}
        rooms={rooms}
        educators={educators} />
    );
  }
}
ClassroomListCreatorFlipped.propTypes = {
  schoolId: React.PropTypes.string.isRequired,
  grade: React.PropTypes.string.isRequired, 
  educators: React.PropTypes.array.isRequired
};


function initialSlots(students) {
  return students.reduce((map, student) => {
    return {
      ...map,
      [student.id]: null
    };
  }, {});
}

class ClassroomListCreatorFlippedView extends React.Component {
  constructor(props) {
    super(props);

    const {students, rooms} = props;
    this.state = {
      sortKey: 'not-yet-placed',
      slots: initialSlots(students)
    };

    this.onResetClicked = this.onResetClicked.bind(this);
  }

  // studentsInRoom(room) {
  //   const {students, rooms} = this.props;
  //   const {slots} = this.state;
  //   const roomIndex = rooms.indexOf(room);
  //   const slotForRoom = roomIndex + 1;
  //   return students.filter(student => slots[student.id] === slotForRoom);
  // }

  sortedStudents() {
    const {students} = this.props;
    return students;
    // const {slots, sortKey} = this.state;

    // return _.sortBy(students, (student, index) => {
    //   if (sortKey === 'not-yet-placed') {
    //     return slots[student.id];
    //   } else if (sortKey === 'classroom') {
    //     return (slots[student.id] === 0)
    //       ? rooms.length + 1
    //       : slots[student.id];
    //   } else if (sortKey === 'alphabetical') {
    //     return student.last_name + ' ' + student.first_name;
    //   }
    //   return index;
    // });
  }

  onResetClicked(e) {
    e.preventDefault();
    const {students} = this.props;
    const slots = initialSlots(students);
    this.setState({slots});
  }

  onSortClicked(sortKey) {
    // scrollTop?
    this.setState({sortKey});
  }

  // onDragStop(student, e, data) {
  //   e.preventDefault();

  //   const {x} = data;
  //   const {slots} = this.state;
  //   const slot = Math.floor(x / width);
  //   this.setState({
  //     ...slots,
  //     [student.id]: slot
  //   });
  // }

  render() {
    const {rooms, communityName, students} = this.props;
    const {slots} = this.state;
    const sortedStudents = this.sortedStudents();

    return (
      <div style={styles.content}>
        <div style={styles.classrooms}>
          <SectionHeading style={styles.sectionHeading}>Classroom community: {communityName}</SectionHeading>
          <div style={{margin: 20}}>
            <div>heading...</div>
            <div>
              <div style={styles.links}>
                Sort by:
                {this.renderSortLink('classroom', 'classroom')}
                {this.renderSortLink('alphabetical', 'alphabetical')}
              </div>
              <div style={styles.links}>
                Actions:
                <a onClick={this.onResetClicked} style={styles.link}>reset to blank</a>
                <a style={styles.link}>randomly assign not yet placed</a>
              </div>
            </div>
          </div>
          <div style={styles.columns}>
            <div className="Flipped-unassigned" style={styles.unassignedList}>
              <SectionHeading>Students to place</SectionHeading>
              {students.map(student => {
                return (
                  <StudentCard
                    key={student.id}
                    student={student}
                    style={{display: 'block'}} />
                );
              })}
            </div>
            <div className="Flipped-classrooms-grid" style={styles.classroomsGrid}>
              <SectionHeading>Classroom communities</SectionHeading>
              <table>
                <tbody>
                  {rooms.map(room => {
                    return (
                      <tr style={styles.room}>
                        <td>{room.name}</td>
                        <td>...students...</td>
                        <td>...stats...</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderSortLink(sortKey, text) {
    const style = {
      ...styles.link,
      ...(sortKey === this.state.sortKey ? styles.selectedLink : {})
    };
    return <a onClick={this.onSortClicked.bind(this, sortKey)} style={style}>{text}</a>;
  }

  /*
  high academic, low academic
  disabilities
  language

  high discipline, low discipline

  gender
  race
  ethnicity
  free/reduced lunch
  */
  renderRoom(room, slotForRoom) {
    const {rooms} = this.props;
    const studentsInRooms = rooms.map(this.studentsInRoom, this);
    const studentsInRoom = studentsInRooms[slotForRoom - 1];
    const containerStyle = (slotForRoom === rooms.length)
      ? styles.column
      : {...styles.column, borderRight: 0};
    return (
      <div key={room} style={containerStyle}>
        <h2>{room}</h2>
        <div style={styles.indicator}>Students: {studentsInRoom.length}</div>
        <div style={styles.indicator}>{'\u00A0'}</div>
        <div style={styles.indicator}>{this.renderLowIncome(studentsInRooms, slotForRoom)}</div>
        <div style={styles.indicator}>{this.renderELL(studentsInRooms, slotForRoom)}</div>
        <div style={styles.indicator}>{this.renderSPED(studentsInRooms, slotForRoom)}</div>
        <div style={styles.indicator}>{this.renderMath(studentsInRooms, slotForRoom)}</div>
        <div style={styles.indicator}>{this.renderReading(studentsInRooms, slotForRoom)}</div>
      </div>
    );
  }

  // TODO(kr) PerDistrict
  renderLowIncome(studentsInRooms, slotForRoom) {
    const percentageInRooms = studentsInRooms.map(students => {
      const count = students.filter(s => -1 !== ['Free Lunch', 'Reduced Lunch'].indexOf(s.free_reduced_lunch)).length;
      return count === 0 ? 0 : Math.round(100 * count / students.length);
    });
    const percent = percentageInRooms[slotForRoom - 1];
    return (
      <div>
        <div>Language</div>
        <Bar percent={percent} threshold={10} styles={{paddingLeft: 20, paddingRight: 20, background: '#ccc', border: '#999', height: 12, width: 100 }} />
      </div>
    );
  }

  // TODO(kr) PerDistrict
  renderELL(studentsInRooms, slotForRoom) {
    const percentageInRooms = studentsInRooms.map(students => {
      const count = students.filter(s => -1 !== ['Fluent'].indexOf(s.limited_english_proficiency)).length;
      return count === 0 ? 0 : Math.round(100 * count / students.length);
    });
    return this.renderOutlier('Learning English', percentageInRooms, percentageInRooms[slotForRoom - 1]);
  }

  // TODO(kr) PerDistrict
  renderSPED(studentsInRooms, slotForRoom) {
    const percentageInRooms = studentsInRooms.map(students => {
      const count = students.filter(s => s.disability !== null).length;
      return count === 0 ? 0 : Math.round(100 * count / students.length);
    });
    return this.renderOutlier('Disability', percentageInRooms, percentageInRooms[slotForRoom - 1]);
  }

  renderMath(studentsInRooms, slotForRoom) {
    return this.renderStar(studentsInRooms, slotForRoom, 'STAR Math', student => student.most_recent_star_math_percentile);
  }

  renderReading(studentsInRooms, slotForRoom) {
    return this.renderStar(studentsInRooms, slotForRoom, 'STAR Reading', student => student.most_recent_star_reading_percentile);
  }

  renderStar(studentsInRooms, slotForRoom, text, accessor) {
    const valuesForRooms = studentsInRooms.map(students => {
      return _.compact(students.map(accessor));
    });
    const values = valuesForRooms[slotForRoom - 1];
    return (
      <div>
        <div>{text}</div>
        <BoxAndWhisker values={values} style={{width: 100, marginLeft: 'auto', marginRight: 'auto'}} />
      </div>
    );
  }

  renderOutlier(text, byRooms, value) {
    const diffByRooms = byRooms.map(byRoom => byRoom - value);
    const maxDiff = _.max(diffByRooms, Math.abs);
    return (maxDiff > 0.10)
        ? <span style={{color: '#3177c9'}}>{text}: {value}%</span>
        : <span style={{color: '#ccc'}}>{text}: {value}%</span>;
  }

  renderFiller(key, style) {
    return <div style={style} key={key}>{key}</div>;
  }

  renderValue(text, value) {
    return (value > 80)
      ? <span style={{color: '#3177c9'}}>{text}: {value}%</span>
      : <span style={{color: '#ccc'}}>{text}: {value}%</span>;
  }
}
ClassroomListCreatorFlippedView.propTypes = {
  communityName: React.PropTypes.string.isRequired,
  rooms: React.PropTypes.array.isRequired,
  students: React.PropTypes.array.isRequired
};



