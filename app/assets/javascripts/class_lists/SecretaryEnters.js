import React from 'react';
import _ from 'lodash';
import DownloadCsvLink from '../components/DownloadCsvLink';
import Button from '../components/Button';
import tableStyles from '../components/tableStyles';
import {gradeText} from '../helpers/gradeText';
import {
  UNPLACED_ROOM_KEY,
  createRooms
} from './studentIdsByRoomFunctions';

export default class SecretaryEnters extends React.Component {
  mapToRows() {
    const {gradeLevelNextYear, students, studentIdsByRoom} = this.props;
    return _.flatten(_.compact(Object.keys(studentIdsByRoom).map(roomKey => {
      return studentIdsByRoom[roomKey].map(studentId => {
        const student = _.find(students, {id: studentId});
        const roomName = roomKey === UNPLACED_ROOM_KEY
          ? 'Not placed'
          : roomKey.split(':')[1];
        return [
          `${student.first_name} ${student.last_name}`,
          student.id, // TODO(kr) not real
          gradeLevelNextYear,
          roomName
        ];
      });
    })));
  }

  render() {
    const {studentIdsByRoom} = this.props;
    const rows = this.mapToRows();
    const rooms = createRooms(Object.keys(studentIdsByRoom).length - 1);

    return (
      <div className="SecretaryEnters">
        <table style={tableStyles.table}>
          <thead>
            <tr>
              <th style={tableStyles.headerCell}>Student</th>
              <th style={tableStyles.headerCell}>LASID</th>
              <th style={tableStyles.headerCell}>Grade next year</th>
              <th style={tableStyles.headerCell}>Classroom next year</th>
            </tr>
          </thead>
          <tbody>{rooms.map(room => {
            const roomTeacher = this.roomTeachers[room.roomKey] || '';
            return (
              <tr key={room.roomKey}>
                <td style={tableStyles.cell}>{room.roomName}</td>
                <td style={tableStyles.cell}><input type="text" onChange={this.onRoomTeacherChanged.bind(this, roomKey)} value={roomTeacher} /></td>
                <td style={tableStyles.cell}>{gradeLevelNextYear}</td>
                <td style={tableStyles.cell}>{roomName}</td>
              </tr>
            );
          })}</tbody>
        </table>
        {this.renderTable(rows)}
        {this.renderDownloadListsLink(rows)}
      </div>
    );
  }

  renderTable(rows) {
    return (
      <table style={tableStyles.table}>
        <thead>
          <tr>
            <th style={tableStyles.headerCell}>Student</th>
            <th style={tableStyles.headerCell}>LASID</th>
            <th style={tableStyles.headerCell}>Grade next year</th>
            <th style={tableStyles.headerCell}>Classroom next year</th>
          </tr>
        </thead>
        <tbody>{rows.map(row => {
          const [name, id, gradeLevelNextYear, roomName] = row;
          return (
            <tr key={id}>
              <td style={tableStyles.cell}>{name}</td>
              <td style={tableStyles.cell}>{id}</td>
              <td style={tableStyles.cell}>{gradeLevelNextYear}</td>
              <td style={tableStyles.cell}>{roomName}</td>
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
    const header = 'Student name,LASID,Room next year';
    const csvText = [header].concat(rows).join('\n');
    return (
      <Button>
        <DownloadCsvLink
          filename={filename}
          csvText={csvText}
          style={{paddingLeft: 20}}>
          Download for Excel
        </DownloadCsvLink>
      </Button>
    );
  }
}
SecretaryEnters.propTypes = {
  gradeLevelNextYear: React.PropTypes.string.isRequired,
  school: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired
  }),
  students: React.PropTypes.array.isRequired,
  studentIdsByRoom: React.PropTypes.object.isRequired
};


