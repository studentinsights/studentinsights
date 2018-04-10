import React from 'react';
import _ from 'lodash';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import SectionHeading from '../components/SectionHeading';
import StudentCard from './StudentCard';
import {gradeText} from '../helpers/gradeText';
import SwipeableViews from 'react-swipeable-views';
import Draggable from 'react-draggable';

function randomValue() {
  return Math.round(Math.random()*100);
}

const width = 165;
const styles = {
  root: {
    overflowY: 'hidden',
    overflowX: 'hidden',
    height: 580, // TODO(kr)
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  loader: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  content: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  sectionHeading: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingTop: 0
  },
  classrooms: {
    padding: 10
  },
  padded: {
    margin: 10
  },
  students: {
    padding: 10,
    paddingTop: 0,
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  links: {
    fontSize: 12,
    paddingLeft: 10
  },
  link: {
    display: 'inline-block',
    padding: 5,
    fontSize: 12,
    color: '#3177c9'
  },
  selectedLink: {
    border: '1px solid #3177c9'
  },
  studentsGrid: {
    flex: 1,
    overflowY: 'scroll',
    overflowX: 'hidden',
    border: '1px solid #ccc'
  },
  listsContainer: {
    display: 'flex'
  },
  indicator: {
    fontSize: 12
  },
  column: {
    width: width,
    backgroundColor: '#eee',
    border: '1px solid #ccc',
    padding: 10
  },
  listStyle: {
    backgroundColor: '#eee',
    border: '1px solid #ccc',
    height: 180,
    width: width
  },
  itemStyle: {
    userSelect: 'none'
  },
  leftListStyle: {
    width: width
  }
};

// For grade-level teaching teams 
export default class ClassroomListCreator extends React.Component {
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
      <div className="ClassroomListCreator" style={styles.root}>
        <GenericLoader
          style={styles.loader}
          promiseFn={this.fetchStudents}
          render={this.renderContent} />
      </div>
    );
  }

  renderContent(json) {
    const {grade, educators} = this.props;
    const {students, school} = json;
    const rooms = ['Room A', 'Room B', 'Room C', 'Room D', 'Room E'];
    const communityName = `${gradeText(grade)} at ${school.name}`;

    return (
      <ClassroomListCreatorView
        communityName={communityName}
        students={students}
        rooms={rooms}
        educators={educators} />
    );
  }
}
ClassroomListCreator.propTypes = {
  schoolId: React.PropTypes.string.isRequired,
  grade: React.PropTypes.string.isRequired, 
  educators: React.PropTypes.array.isRequired
};


function initialSlots(students, rooms) {
  return students.reduce((map, student) => {
    return {
      ...map,
      [student.id]: Math.floor(Math.random()*(rooms.length + 1))
    };
  }, {});
}

class ClassroomListCreatorView extends React.Component {
  constructor(props) {
    super(props);

    const {students, rooms} = props;
    this.state = {
      sortKey: 'not-yet-placed',
      slots: initialSlots(students, rooms)
    };

    this.onResetClicked = this.onResetClicked.bind(this);
  }

  studentsInRoom(room) {
    const {students, rooms} = this.props;
    const {slots} = this.state;
    const roomIndex = rooms.indexOf(room);
    const slotForRoom = roomIndex + 1;
    return students.filter(student => slots[student.id] === slotForRoom);
  }

  sortedStudents() {
    const {students, rooms} = this.props;
    const {slots, sortKey} = this.state;

    return _.sortBy(students, (student, index) => {
      if (sortKey === 'not-yet-placed') {
        return slots[student.id];
      } else if (sortKey === 'classroom') {
        return (slots[student.id] === 0)
          ? rooms.length + 1
          : slots[student.id];
      } else if (sortKey === 'alphabetical') {
        return student.last_name + ' ' + student.first_name;
      }
      return index;
    });
  }

  onResetClicked() {
    const {students} = this.props;
    const slots = students.reduce((map, student) => {
      return {
        ...map,
        [student.id]: 0
      };
    }, {});
    this.setState({slots});
  }

  onSortClicked(sortKey) {
    // scrollTop?
    this.setState({sortKey});
  }

  onDragStop(student, e, data) {
    const {x} = data;
    const {slots} = this.state;
    const slot = Math.floor(x / width);
    this.setState({
      ...slots,
      [student.id]: slot
    });
  }

  render() {
    const {rooms, communityName, students} = this.props;
    const {slots} = this.state;
    const sortedStudents = this.sortedStudents();

    return (
      <div style={styles.content}>
        <div style={styles.classrooms}>
          <SectionHeading style={styles.sectionHeading}>Classroom community: {communityName}</SectionHeading>
          <div style={styles.padded}>
            <div style={styles.listsContainer}>
              <div key="unplaced" style={styles.column}>
                <h2>Not yet placed</h2>
              </div>
              {rooms.map((room, index) => this.renderRoom(room, index + 1))}
            </div>
          </div>
        </div>
        <div style={styles.students}>
          <SectionHeading style={styles.sectionHeading}>Students to place: {students.length}</SectionHeading>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
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
          <div style={styles.studentsGrid}>
            {sortedStudents.map(student => {
              const slot = slots[student.id];

              // const {spring} = popmotion;
              // const props = {
              //   draggable: true,
              //   dragEnd: { transition: spring }
              // };
              // const Box = posed.div(props);
              // return <Box>

                  // onStart={this.handleStart}
                  // onDrag={this.handleDrag}
                  // onStop={this.handleStop}>


              // <Draggable /> requires a <div /> to be the child.
              return (
                <Draggable
                  key={student.id}
                  axis="x"
                  defaultPosition={{x: width * slot, y: 0}}
                  grid={[width, 0]}
                  onStop={this.onDragStop.bind(this, student)}>
                  <div>
                   <StudentCard
                    student={student}
                    style={{fontSize: 12, width}} />
                  </div>
                </Draggable>
              );
              // return (
              //   <SwipeableViews
              //     key={student.id}
              //     enableMouseEvents={true}>
              //     {this.renderFiller(0, {width})}
              //     {this.renderFiller(1, {width})}
              //     {this.renderFiller(2, {width})}
              //     <StudentCard
              //       student={student}
              //       style={{
              //         display: 'block',
              //         fontSize: 12,
              //         width
              //       }} />
              //     {this.renderFiller(4, {width})}
              //     {this.renderFiller(5, {width})}
              //     {this.renderFiller(6, {width})}
              //   </SwipeableViews>
              // );
            })}
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

  renderRoom(room, slotForRoom) {
    const {rooms} = this.props;
    const studentsInRooms = rooms.map(this.studentsInRoom, this);
    const studentsInRoom = studentsInRooms[slotForRoom - 1];

    return (
      <div key={room} style={styles.column}>
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

  renderLowIncome(studentsInRooms, slotForRoom) {
    // const {students, rooms} = this.props;
    return this.renderValue('Low income', randomValue());
  }

  renderELL(room) {
    return this.renderValue('ELL', randomValue());
  }

  renderSPED(room) {
    return this.renderValue('SPED', randomValue());
  }

  renderMath(room) {
    return this.renderValue('<25th Math', randomValue());
  }

  renderReading(room) {
    return this.renderValue('<25th Reading', randomValue());
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
ClassroomListCreatorView.propTypes = {
  communityName: React.PropTypes.string.isRequired,
  rooms: React.PropTypes.array.isRequired,
  students: React.PropTypes.array.isRequired
};



