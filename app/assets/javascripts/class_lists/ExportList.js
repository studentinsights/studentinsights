import React from 'react';
import _ from 'lodash';
import DownloadCsvLink from '../components/DownloadCsvLink';
import Button from '../components/Button';
import SuccessLabel from '../components/SuccessLabel';
import tableStyles from '../components/tableStyles';
import {gradeText} from '../helpers/gradeText';
import {
  UNPLACED_ROOM_KEY,
  createRooms
} from './studentIdsByRoomFunctions';
import ClassLists from './ClassLists';


export default class ExportList extends React.Component {
  constructor(props) {
    super(props);
    
    // TODO(kr) remove
    this.state = {
      roomTeachers: {}
    };
  }

  mapToRows(studentIdsByRoom) {
    const {gradeLevelNextYear, students} = this.props;
    const {roomTeachers} = this.state;

    return _.flatten(_.compact(Object.keys(studentIdsByRoom).map(roomKey => {
      return studentIdsByRoom[roomKey].map(studentId => {
        const student = _.find(students, {id: studentId});
        const teacherText = roomTeachers[roomKey];
        return [
          gradeLevelNextYear,
          student.id, // TODO(kr) not real
          `${student.first_name} ${student.last_name}`,
          teacherText
        ];
      });
    })));
  }

  onRoomTeacherChanged(roomKey, e) {
    e.preventDefault();
    const {roomTeachers} = this.state;
    this.setState({
      roomTeachers: {
        ...roomTeachers,
        [roomKey]: e.target.value
      }
    });
  }

  // Button onClick does nothing, since DownloadCsvLink handles it,
  // we're just using Button for the visual.
  onDownloadButtonClicked(e) {}

  render() {
    const {
      headingStyle,
      descriptionStyle,
      teacherStudentIdsByRoom,
      principalStudentIdsByRoom
    } = this.props;
    const studentIdsByRoom = principalStudentIdsByRoom || teacherStudentIdsByRoom; // TODO(kr)
    const rows = this.mapToRows(studentIdsByRoom);

    return (
      <div className="SecretaryEnters">
        <div style={headingStyle}>Do your changes consider the teachers' plan and notes to the principal?</div>
        <div style={{...descriptionStyle, ...styles.spaceBelow}}>There may be good reasons to revise class lists, but check out the teaching team's intention in <i>Make a plan</i> and <i>Share notes</i> first.</div>
        <div style={styles.spaceBelow}>{this.renderMoved(studentIdsByRoom)}</div>
        <div style={styles.spaceBelow}>{this.renderUnplaced(studentIdsByRoom)}</div>

        <div style={headingStyle}>Who will teach each classroom?</div>
        <div style={styles.spaceBelow}>{this.renderTeacherAssignment(studentIdsByRoom)}</div>
        
        {/* {this.renderTable(rows)} */}
        <div style={styles.spaceBelow}>{this.renderDownloadListsLink(rows)}</div>
      </div>
    );
  }

  renderUnplaced(studentIdsByRoom) {
    const unplacedCount = studentIdsByRoom[UNPLACED_ROOM_KEY].length;
    if (unplacedCount === 0) return <SuccessLabel style={styles.placementMessage} text="All students have been placed." />;
    if (unplacedCount === 1) return <SuccessLabel style={{...styles.placementMessage, ...styles.placementWarning}} text={`There is one student who has not been placed in a classroom.`} />;
    if (unplacedCount > 1) return <SuccessLabel style={{...styles.placementMessage, ...styles.placementWarning}} text={`There are ${unplacedCount} students who have not been placed in a classroom.`} />;
  }

  renderMoved(studentIdsByRoom) {
    const {teacherStudentIdsByRoom, students, fetchProfile} = this.props;

    // roomKeys for both teacher and principal lists should always be the same,
    // but this is defensive
    const roomKeys = _.uniq(Object.keys(teacherStudentIdsByRoom).concat(Object.keys(studentIdsByRoom)));
    const movements = _.flatten(roomKeys.map(roomKey => {
      const studentIds = studentIdsByRoom[roomKey];
      const movedStudentIds = studentIds.filter(studentId => {
        return teacherStudentIdsByRoom[roomKey].indexOf(studentId) === -1;
      });
      return movedStudentIds.map(studentId => {
        const student = _.find(students, { id: studentId });
        return {student, roomKey};
      });
    }));

    // Show rooms with moved students
    const movedStudents = movements.map(movement => movement.student);
    const movedStudentIdsByRoom = movements.reduce((map, movement) => {
      return {
        ...map,
        [movement.roomKey]: (map[movement.roomKey] || []).concat(movement.student.id)
      };
    }, {});
    const rooms = createRooms(roomKeys.length - 1);
    return (
      <ClassLists
        students={movedStudents}
        studentIdsByRoom={movedStudentIdsByRoom}
        rooms={rooms}
        fetchProfile={fetchProfile}

        isEditable={false}
        highlightKey={null}
        isExpandedVertically={false}
        // onRoomNameClicked={this.onRoomNameClicked
        onDragEnd={function() {}}
        onClassListsChanged={function() {}}
        onExpandVerticallyToggled={function() {}}
      />
    );

    // return (
    //   <div>
    //     {movements.map((movement, index) => {
    //       const {student} = movement;
    //       // return <li key={student.id}>{student.first_name} {student.last_name}</li>;
    //       return (
    //         <StudentCard
    //           key={student.id}
    //           style={{display: 'inline-block'}}
    //           highlightKey={null}
    //           student={student}
    //           index={index}
    //           fetchProfile={fetchProfile}
    //           isEditable={false} />
    //       );
    //     })}
    //   </div>
    // );
  }

  renderTeacherAssignment(studentIdsByRoom) {
    const {roomTeachers} = this.state;
    const rooms = createRooms(Object.keys(studentIdsByRoom).length - 1).filter(room => {
      return room.roomKey !== UNPLACED_ROOM_KEY;
    });

    return (
      <table style={{...tableStyles.table, marginLeft: 0}}>
        <thead>
          <tr>
            <th style={tableStyles.headerCell}>Room</th>
            <th style={tableStyles.headerCell}>Teacher</th>
          </tr>
        </thead>
        <tbody>{rooms.map(room => {
          const teacherText = roomTeachers[room.roomKey] || '';
          return (
            <tr key={room.roomKey}>
              <td style={tableStyles.cell}>{room.roomName}</td>
              <td style={tableStyles.cell}>
                <input style={styles.input} type="text" onChange={this.onRoomTeacherChanged.bind(this, room.roomKey)} value={teacherText} />
              </td>
            </tr>
          );
        })}</tbody>
      </table>
    );
  }

  renderTable(rows) {
    return (
      <table style={{...tableStyles.table, marginLeft: 0}}>
        <thead>
          <tr>
            <th style={tableStyles.headerCell}>Grade next year</th>
            <th style={tableStyles.headerCell}>LASID</th>
            <th style={tableStyles.headerCell}>Student name</th>
            <th style={tableStyles.headerCell}>Homeroom teacher next year</th>
          </tr>
        </thead>
        <tbody>{rows.map(row => {
          const [gradeLevelNextYear, id, name, teacherText] = row;
          return (
            <tr key={id}>
              <td style={tableStyles.cell}>{gradeLevelNextYear}</td>
              <td style={tableStyles.cell}>{id}</td>
              <td style={tableStyles.cell}>{name}</td>
              <td style={tableStyles.cell}>{teacherText}</td>
            </tr>
          );
        })}</tbody>
      </table>
    );
  }

  renderDownloadListsLink(rows) {
    const {gradeLevelNextYear, school} = this.props;
    const gradeLevelText = gradeText(gradeLevelNextYear);
    const dateText = moment.utc().format('YYYY-MM-DD');
    const filename = `Class list: ${gradeLevelText} at ${school.name} ${dateText}.csv`;
    const header = 'Grade level next year,LASID,Student name,Room next year';
    const csvText = [header].concat(rows).join('\n');

    return (
      <Button onClick={this.onDownloadButtonClicked} style={styles.button}>
        <DownloadCsvLink
          style={styles.download}
          filename={filename}
          csvText={csvText}>
          Download class lists spreadsheet
        </DownloadCsvLink>
      </Button>
    );
  }
}
ExportList.propTypes = {
  gradeLevelNextYear: React.PropTypes.string.isRequired,
  school: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired
  }),
  students: React.PropTypes.array.isRequired,
  fetchProfile: React.PropTypes.func.isRequired,
  teacherStudentIdsByRoom: React.PropTypes.object.isRequired,
  principalStudentIdsByRoom: React.PropTypes.object,
  principalTeacherNamesByRoom: React.PropTypes.object.isRequired,
  headingStyle: React.PropTypes.object,
  descriptionStyle: React.PropTypes.object
};


const styles = {
  placementMessage: {
    display: 'inline-block',
    marginTop: 10,
    marginBottom: 10
  },
  placementWarning: {
    backgroundColor: 'orange',
    color: 'white',
    borderColor: 'darkorange'
  },
  input: {
    fontSize: 14
  },
  button: {
    padding: 0,
    marginTop: 20
  },
  download: {
    display: 'inline-block',
    textDecoration: 'none',
    color: 'white',
    padding: '8px 25px'
  },
  spaceBelow: {
    marginBottom: 20
  }
};
