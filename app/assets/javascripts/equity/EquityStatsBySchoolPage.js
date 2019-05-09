import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import ExperimentalBanner from '../components/ExperimentalBanner';
import {apiFetchJson} from '../helpers/apiFetchJson';
import ClassroomStats from '../class_lists/ClassroomStats';

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
        <SectionHeading>K8 students grouped by schools, {nowText}</SectionHeading>
        <GenericLoader
          promiseFn={() => apiFetchJson('/api/equity/stats_by_school_json')}
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
      const roomKey = `room:${roomIndex}`;
      const studentsInRoom = studentIdsByRoom[roomKey] || [];
      if (studentsInRoom.length === 0) return null;
      return {
        roomKey,
        roomIndex,
        roomName: '<redacted>'
      };
    }));

    console.log('studentIdsByRoom', studentIdsByRoom);
    console.log('rooms', rooms);
    const {highlightKey} = this.state;
    return (
      <div style={{height: 600}}>
        <ClassroomStats
          students={students}
          gradeLevelNextYear={"8"} // suggests STAR, not F&P
          rooms={rooms}
          studentIdsByRoom={studentIdsByRoom}
          highlightKey={highlightKey}
          onCategorySelected={this.onCategorySelected}
        />
        <div style={{margin: 20, fontSize: 14}}>{students.length} total students</div>
      </div>
    );
  }
}
EquityStatsBySchoolPage.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
