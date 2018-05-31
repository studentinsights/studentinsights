import React from 'react';
import _ from 'lodash';
import DownloadCsvLink from '../components/DownloadCsvLink';
import Button from '../components/Button';
import SuccessLabel from '../components/SuccessLabel';
import tableStyles from '../components/tableStyles';
import {gradeText} from '../helpers/gradeText';
import {
  UNPLACED_ROOM_KEY,
  createRooms,
  findMovedStudentIds
} from './studentIdsByRoomFunctions';


// Allows principals to set the names of teachers for each room, and export
// to a spreadsheet.  Others can view but can't export if the principal hasn't
// added names yet.
// The CSV download is within the browser.
export default class ExportList extends React.Component {
  mapToRows(studentIdsByRoom) {
    const {gradeLevelNextYear, students, principalTeacherNamesByRoom} = this.props;

    return _.flatten(_.compact(Object.keys(studentIdsByRoom).map(roomKey => {
      return studentIdsByRoom[roomKey].map(studentId => {
        const student = _.find(students, {id: studentId});
        const teacherText = principalTeacherNamesByRoom[roomKey] || 'Not placed';
        return [
          gradeLevelNextYear,
          student.local_id,
          `${student.first_name} ${student.last_name}`,
          teacherText
        ];
      });
    })));
  }

  isReadyToExport(studentIdsByRoom) {
    const {principalTeacherNamesByRoom} = this.props;
    const isMissingTeacherNames = (Object.keys(principalTeacherNamesByRoom).length < Object.keys(studentIdsByRoom).length - 1);
    const hasBlankTeacherName = _.any(_.values(principalTeacherNamesByRoom), _.isEmpty);

    return (!isMissingTeacherNames && !hasBlankTeacherName);
  }

  onRoomTeacherChanged(roomKey, e) {
    e.preventDefault();

    const {principalTeacherNamesByRoom, onPrincipalTeacherNamesByRoomChanged} = this.props;
    onPrincipalTeacherNamesByRoomChanged({
      ...principalTeacherNamesByRoom,
      [roomKey]: e.target.value
    });
  }

  // Button onClick does nothing, since DownloadCsvLink handles it,
  // we're just using Button for the visual.
  onDownloadButtonClicked(e) {}

  render() {
    const {
      headingStyle,
      teacherStudentIdsByRoom,
      principalStudentIdsByRoom
    } = this.props;
    const studentIdsByRoom = principalStudentIdsByRoom || teacherStudentIdsByRoom; // TODO(kr)
    const rows = this.mapToRows(studentIdsByRoom);

    return (
      <div className="SecretaryEnters">
        <div style={headingStyle}>Have all students been placed?</div>
        <div style={styles.spaceBelow}>{this.renderUnplaced(studentIdsByRoom)}</div>
        
        <div style={headingStyle}>Have you reviewed the teaching team's plan and notes before making changes?</div>
        <div style={styles.spaceBelow}>{this.renderMoved(studentIdsByRoom)}</div>

        <div style={headingStyle}>Who will teach each classroom?</div>
        <div style={styles.spaceBelow}>{this.renderTeacherAssignment(studentIdsByRoom)}</div>
        
        {/* {this.renderTable(rows)} */}
        <div style={styles.spaceBelow}>{this.renderDownloadListsLink(studentIdsByRoom, rows)}</div>
      </div>
    );
  }

  renderUnplaced(studentIdsByRoom) {
    const unplacedCount = studentIdsByRoom[UNPLACED_ROOM_KEY].length;
    if (unplacedCount === 0) return <SuccessLabel style={styles.placementMessage} text="All students have been placed." />;
    if (unplacedCount === 1) return this.renderWarning(`There is one student who has not been placed in a classroom.`);
    if (unplacedCount > 1) return this.renderWarning(`There are ${unplacedCount} students who have not been placed in a classroom.`);
  }

  renderMoved(studentIdsByRoom) {
    const {teacherStudentIdsByRoom} = this.props;
    const movedStudentsCount = findMovedStudentIds(teacherStudentIdsByRoom, studentIdsByRoom).length;

    if (movedStudentsCount === 0) return <SuccessLabel style={styles.placementMessage} text="No students were moved." />;
    if (movedStudentsCount === 1) return this.renderWarning(`You made one revision to the teaching team's original plan.`);
    if (movedStudentsCount > 1) return this.renderWarning(`You made ${movedStudentsCount} revisions to the teaching team's original plan.`);
  }

  renderWarning(text) {
    return <SuccessLabel style={{...styles.placementMessage, ...styles.placementWarning}} text={text} />;
  }

  renderTeacherAssignment(studentIdsByRoom) {
    const {principalTeacherNamesByRoom, isRevisable} = this.props;
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
          const teacherText = principalTeacherNamesByRoom[room.roomKey] || '';
          return (
            <tr key={room.roomKey}>
              <td style={tableStyles.cell}>{room.roomName}</td>
              <td style={tableStyles.cell}>
                <input
                  style={styles.input}
                  disabled={!isRevisable}
                  type="text"
                  onChange={this.onRoomTeacherChanged.bind(this, room.roomKey)}
                  value={teacherText} />
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

  renderDownloadListsLink(studentIdsByRoom, rows) {
    const isReadyToExport = this.isReadyToExport(studentIdsByRoom);
    const {gradeLevelNextYear, school} = this.props;
    const gradeLevelText = gradeText(gradeLevelNextYear);
    const dateText = moment.utc().format('YYYY-MM-DD');
    const filename = `Class list: ${gradeLevelText} at ${school.name} ${dateText}.csv`;
    const header = 'Grade level next year,LASID,Student name,Room next year';
    const csvText = [header].concat(rows).join('\n');

    return (
      <div>
        <Button
          onClick={this.onDownloadButtonClicked}
          containerStyle={{display: 'inline-block'}}
          style={{...styles.button, ...(isReadyToExport ? {} : styles.buttonDisabled)}}
          hoverStyle={isReadyToExport ? {} : styles.buttonDisabled}>
          <DownloadCsvLink
            disabled={!isReadyToExport}
            style={{...styles.download, ...(isReadyToExport ? {} : { color: '#999' })}}
            filename={filename}
            csvText={csvText}>
            Download class lists spreadsheet
          </DownloadCsvLink>
        </Button>
        {!isReadyToExport &&
          <div style={styles.warnExport}>{this.renderWarning('Teachers need to be assigned to each homeroom first')}</div>
        }
      </div>
    );
  }
}
ExportList.propTypes = {
  isRevisable: React.PropTypes.bool.isRequired,
  gradeLevelNextYear: React.PropTypes.string.isRequired,
  school: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired
  }),
  students: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.number.isRequired,
    local_id: React.PropTypes.string.isRequired,
    first_name: React.PropTypes.string.isRequired,
    last_name: React.PropTypes.string.isRequired
  })).isRequired,
  fetchProfile: React.PropTypes.func.isRequired,
  teacherStudentIdsByRoom: React.PropTypes.object.isRequired,
  principalStudentIdsByRoom: React.PropTypes.object,
  principalTeacherNamesByRoom: React.PropTypes.object.isRequired,
  onPrincipalTeacherNamesByRoomChanged:  React.PropTypes.func,
  headingStyle: React.PropTypes.object
};


const styles = {
  placementMessage: {
    display: 'inline-block',
    marginTop: 10,
    marginBottom: 10
  },
  placementWarning: {
    background: 'orange',
    color: 'white',
    borderColor: 'darkorange'
  },
  input: {
    fontSize: 14
  },
  button: {
    display: 'inline-block',
    padding: 0,
    marginTop: 20
  },
  buttonDisabled: {
    background: '#ccc',
    color: '#333',
    cursor: 'default'
  },
  download: {
    display: 'inline-block',
    textDecoration: 'none',
    color: 'white',
    padding: '8px 25px'
  },
  spaceBelow: {
    marginBottom: 10
  },
  warnExport: {
    display: 'inline-block',
    marginLeft: 10
  }
};
