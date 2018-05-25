import React from 'react';
import _ from 'lodash';
import DownloadCsvLink from '../components/DownloadCsvLink';
import Button from '../components/Button';
import SectionHeading from '../components/SectionHeading';
import tableStyles from '../components/tableStyles';
import {gradeText} from '../helpers/gradeText';
import {toMomentFromTime} from '../helpers/toMoment';
import {
  UNPLACED_ROOM_KEY,
  createRooms
} from './studentIdsByRoomFunctions';

export default class SecretaryEnters extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      roomTeachers: {}
    };
  }

  mapToRows() {
    const {gradeLevelNextYear, students, studentIdsByRoom} = this.props;
    const {roomTeachers} = this.state;

    return _.flatten(_.compact(Object.keys(studentIdsByRoom).map(roomKey => {
      return studentIdsByRoom[roomKey].map(studentId => {
        const student = _.find(students, {id: studentId});
        const teacherText = roomTeachers[roomKey];
        return [
          gradeLevelNextYear,
          student.id, // TODO(kr) not real
          toMomentFromTime(student.date_of_birth).format('M/D/YYYY'),
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

  render() {
    const {gradeLevelNextYear} = this.props;
    const rows = this.mapToRows();

    return (
      <div className="SecretaryEnters">
        <SectionHeading>Next year's {gradeText(gradeLevelNextYear)}</SectionHeading>
        {this.renderTeacherAssignment()}
        {this.renderTable(rows)}
        {this.renderDownloadListsLink(rows)}
      </div>
    );
  }

  renderTeacherAssignment() {
    const {studentIdsByRoom} = this.props;
    const {roomTeachers} = this.state;
    const rooms = createRooms(Object.keys(studentIdsByRoom).length - 1).filter(room => {
      return room.roomKey === UNPLACED_ROOM_KEY;
    });

    return (
      <div>
        UNPLACED!!!!!!!!!!!!!!!!
        <table style={tableStyles.table}>
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
                  <input type="text" onChange={this.onRoomTeacherChanged.bind(this, room.roomKey)} value={teacherText} />
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    );
  }

  renderTable(rows) {
    return (
      <table style={tableStyles.table}>
        <thead>
          <tr>
            <th style={tableStyles.headerCell}>Grade next year</th>
            <th style={tableStyles.headerCell}>LASID</th>
            <th style={tableStyles.headerCell}>Date of birth</th>
            <th style={tableStyles.headerCell}>Student name</th>
            <th style={tableStyles.headerCell}>Homeroom teacher next year</th>
          </tr>
        </thead>
        <tbody>{rows.map(row => {
          const [gradeLevelNextYear, id, dateOfBirth, name, teacherText] = row;
          return (
            <tr key={id}>
              <td style={tableStyles.cell}>{gradeLevelNextYear}</td>
              <td style={tableStyles.cell}>{dateOfBirth}</td>
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


