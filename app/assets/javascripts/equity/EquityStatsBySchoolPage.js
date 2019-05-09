import React from 'react';
import _ from 'lodash';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import ExperimentalBanner from '../components/ExperimentalBanner';
import {apiFetchJson} from '../helpers/apiFetchJson';
import ClassroomStats from '../class_lists/ClassroomStats';
import {UNPLACED_ROOM_KEY} from '../class_lists/studentIdsByRoomFunctions';

// Shows the class list equity dimensions, but grouped by school.
export default class EquityStatsBySchoolPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      highlightKey: null
    };

    this.onCategorySelected = this.onCategorySelected.bind(this);
  }

  onCategorySelected(highlightKey) {
    this.setState({highlightKey});
  }

  render() {
    const {nowFn} = this.context;
    const nowText = nowFn().format('M/D/YY');
    return (
      <div className="EquityStatsBySchoolPage">
        <ExperimentalBanner />
        <SectionHeading>Across schools, {nowText}</SectionHeading>
        <GenericLoader
          promiseFn={() => apiFetchJson('/api/equity/equity_stats_by_school_json')}
          render={json => this.renderJson(json)}
        />
      </div>
    );
  }

  renderJson(json) {
    const students = json.students;
    const schoolIds = _.uniq(students.map(student => student.school_id)).sort();
    const studentIdsByRoom = {};
    students.forEach(student => {
      const roomIndex = schoolIds.indexOf(student.school_id);
      const roomKey = `room:${roomIndex}`;
      studentIdsByRoom[roomKey] = (studentIdsByRoom[roomKey] || []).concat(student.id);
    });
    const rooms = _.compact(schoolIds.map(schoolId => {
      const roomIndex = schoolIds.indexOf(schoolId);
      const roomKey = `room:${schoolId}`;
      const studentsInRoom = studentIdsByRoom[roomKey] || [];
      if (studentsInRoom.length === 0) return null;
      return {
        roomKey,
        roomIndex,
        roomName: '<redacted>'
      };
    }));

    const {highlightKey} = this.state;
    return (
      <div style={{height: 600}}>
        <ClassroomStats
          students={students}
          gradeLevelNextYear={"8"} // suggests STAR, not F&P
          rooms={rooms.filter(room => room.roomKey !== UNPLACED_ROOM_KEY)}
          studentIdsByRoom={studentIdsByRoom}
          highlightKey={highlightKey}
          onCategorySelected={this.onCategorySelected}
        />
      </div>
    );
  }
}
