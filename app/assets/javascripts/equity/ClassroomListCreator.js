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
    padding: 10,
    paddingBottom: 0
  },
  listsContainer: {
    display: 'flex',
    margin: 10,
    marginBottom: 0,
    borderBottom: '1px solid black'
  },
  students: {
    padding: 20,
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
    /* backgroundColor: 'rgba(243, 136, 42, 0.18)' */
  },
  indicator: {
    fontSize: 12
  },
  column: {
    width: width,
    backgroundColor: '#eee',
    border: '1px solid #ccc',
    borderBottom: 0,
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
      [student.id]: Math.floor(Math.random()*rooms.length + 1)
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
    e.preventDefault();

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
          <div style={styles.listsContainer}>
            <div key="unplaced" style={{...styles.column, borderRight: 0}}>
              <h2>Not yet placed</h2>
              <div style={styles.indicator}>Students left to place: {sortedStudents.length}</div>
            </div>
            {rooms.map((room, index) => this.renderRoom(room, index + 1))}
          </div>
        </div>
        <div style={styles.students}>
          <div style={styles.studentsGrid}>
            {sortedStudents.map(student => {
              const slot = slots[student.id];

              // TODO(kr) calling setState in onStop doesn't work with
              // updated defaultPosition.  This means "action" links don't work.
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
                    style={{width}} />
                  </div>
                </Draggable>
              );
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
ClassroomListCreatorView.propTypes = {
  communityName: React.PropTypes.string.isRequired,
  rooms: React.PropTypes.array.isRequired,
  students: React.PropTypes.array.isRequired
};



