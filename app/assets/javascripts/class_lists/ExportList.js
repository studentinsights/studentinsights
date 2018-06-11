import React from 'react';
import {Creatable} from 'react-select';
import 'react-select/dist/react-select.css';
import _ from 'lodash';
import DownloadCsvLink, {joinCsvRow} from '../components/DownloadCsvLink';
import SuccessLabel from '../components/SuccessLabel';
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

    const rows = _.flatten(_.compact(Object.keys(studentIdsByRoom).map(roomKey => {
      return studentIdsByRoom[roomKey].map(studentId => {
        const student = _.find(students, {id: studentId});
        const teacherText = principalTeacherNamesByRoom[roomKey] || 'Not placed';
        return [
          `${student.last_name}, ${student.first_name}`,
          student.local_id,
          gradeLevelNextYear,
          teacherText
        ];
      });
    })));

    // Sort by name for secretaries
    return _.sortBy(rows, row => row[0]);
  }

  isReadyToExport(studentIdsByRoom) {
    const {principalTeacherNamesByRoom} = this.props;
    const isMissingTeacherNames = (Object.keys(principalTeacherNamesByRoom).length < Object.keys(studentIdsByRoom).length - 1);
    const hasBlankTeacherName = _.any(_.values(principalTeacherNamesByRoom), _.isEmpty);

    return (!isMissingTeacherNames && !hasBlankTeacherName);
  }

  // This overrides the default, which includes the comma key as well, which
  // doesn't make sense with (lastname, firstname) here.
  shouldKeyDownEventCreateNewOption(keyCode) {
    if ((keyCode === 9) || (keyCode === 13)) return true;
    return false;
  }

  onRoomTeacherChanged(roomKey, option) {
    const {principalTeacherNamesByRoom, onPrincipalTeacherNamesByRoomChanged} = this.props;
    onPrincipalTeacherNamesByRoomChanged({
      ...principalTeacherNamesByRoom,
      [roomKey]: (option === null) ? '' : option.name
    });
  }

  render() {
    const {
      headingStyle,
      teacherStudentIdsByRoom,
      principalStudentIdsByRoom,
      gradeLevelNextYear
    } = this.props;
    const studentIdsByRoom = principalStudentIdsByRoom || teacherStudentIdsByRoom; // TODO(kr)
    const rows = this.mapToRows(studentIdsByRoom);

    return (
      <div className="ExportList">
        <div style={headingStyle}>Have all students been placed for next year's {gradeText(gradeLevelNextYear)}?</div>
        <div style={styles.spaceBelow}>{this.renderUnplaced(studentIdsByRoom)}</div>
        
        <div style={headingStyle}>Have you reviewed the team's plan and notes before making changes?</div>
        <div style={styles.spaceBelow}>{this.renderMoved(studentIdsByRoom)}</div>

        <div style={headingStyle}>Who will teach next year's {gradeText(gradeLevelNextYear)}?</div>
        <div>{this.renderTeacherAssignment(studentIdsByRoom)}</div>
        <div>{this.renderDownloadListsLink(studentIdsByRoom, rows)}</div>
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
    if (movedStudentsCount === 1) return this.renderWarning(`You made one revision to the team's original plan.`);
    if (movedStudentsCount > 1) return this.renderWarning(`You made ${movedStudentsCount} revisions to the team's original plan.`);
  }

  renderWarning(text) {
    return <SuccessLabel style={{...styles.placementMessage, ...styles.placementWarning}} text={text} />;
  }

  renderTeacherAssignment(studentIdsByRoom) {
    const {principalTeacherNamesByRoom, educators, isRevisable} = this.props;
    const rooms = createRooms(Object.keys(studentIdsByRoom).length - 1).filter(room => {
      return room.roomKey !== UNPLACED_ROOM_KEY;
    });

    // Include created names as options as well.
    const createdNames = _.values(principalTeacherNamesByRoom);
    const educatorNames = educators.map(educator => educator.full_name);
    const uniqueSortedNames = _.sortBy(_.uniq(createdNames.concat(educatorNames)), educator => educator.toLowerCase());
    const options = uniqueSortedNames.map(name => { return {name}; });

    return (
      <table style={styles.table}>
        <tbody>{rooms.map(room => {
          const teacherText = principalTeacherNamesByRoom[room.roomKey] || '';
          return (
            <tr key={room.roomKey}>
              <td style={styles.cell}>{room.roomName}</td>
              <td style={styles.cell}>
                <Creatable
                  valueKey="name"
                  labelKey="name"
                  placeholder="Select or type..."
                  style={styles.select}
                  options={options}
                  disabled={!isRevisable}
                  autosize={false} // IE11, see https://github.com/JedWatson/react-select/issues/733#issuecomment-237562382
                  multi={false}
                  clearable={false}
                  value={teacherText}
                  promptTextCreator={_.identity}
                  shouldKeyDownEventCreateNewOption={this.shouldKeyDownEventCreateNewOption}
                  onChange={this.onRoomTeacherChanged.bind(this, room.roomKey)}
                  backspaceRemoves={true} />
              </td>
            </tr>
          );
        })}</tbody>
      </table>
    );
  }

  renderDownloadListsLink(studentIdsByRoom, rows) {
    const {nowFn} = this.context;
    const now = nowFn();
    const isReadyToExport = this.isReadyToExport(studentIdsByRoom);
    const {gradeLevelNextYear, school} = this.props;
    const gradeLevelText = gradeText(gradeLevelNextYear);
    const dateText = now.format('YYYY-MM-DD');
    const filename = `Class list: ${gradeLevelText} at ${school.name} ${dateText}.csv`;
    const header = joinCsvRow([
      'Student name',
      'LASID',
      'Grade level next year',
      'Room next year'
    ]);
    const csvText = [header].concat(rows.map(joinCsvRow)).join('\n');

    return (
      <div>
        <DownloadCsvLink
          disabled={!isReadyToExport}
          style={styles.download}
          filename={filename}
          csvText={csvText}>
          Download class lists spreadsheet
        </DownloadCsvLink>
        {!isReadyToExport &&
          <div style={styles.warnExport}>{this.renderWarning('Teachers need to be assigned to each homeroom first')}</div>
        }
      </div>
    );
  }
}
ExportList.contextTypes = {
  nowFn: React.PropTypes.func.isRequired
};
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
  educators: React.PropTypes.arrayOf(React.PropTypes.shape({
    full_name: React.PropTypes.string.isRequired
  })).isRequired,
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
  select: {
    width: '20em'
  },
  table: {
    borderCollapse: 'collapse',
    marginTop: 5
  },
  cell: {
    padding: '2px 8px'
  },
  download: {
    display: 'inline-block',
    textDecoration: 'none',
    color: 'white',
    marginTop: 20
  },
  spaceBelow: {},
  warnExport: {
    display: 'inline-block',
    marginLeft: 10
  }
};
