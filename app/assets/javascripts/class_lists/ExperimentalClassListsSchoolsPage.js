import React from 'react';
import _ from 'lodash';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import {apiFetchJson} from '../helpers/apiFetchJson';
import ClassroomStats from '../class_lists/ClassroomStats';
import {UNPLACED_ROOM_KEY} from '../class_lists/studentIdsByRoomFunctions';

// Show users their class lists.  More useful for principals, building admin,
// or ELL/SPED teachers than classroom teachers (who are typically
// making a single list).
export default class ExperimentalClassListsSchoolsPage extends React.Component {
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
    console.log('render');
    return (
      <div className="ExperimentalClassListsSchoolsPage">
        <SectionHeading>Across schools</SectionHeading>
        <GenericLoader
          // style={styles.root}
          promiseFn={() => apiFetchJson('/api/class_lists/experimental_schools_json')}
          render={json => this.renderJson(json)}
        />
      </div>
    );
  }

  renderJson(json) {
    console.log('renderJson', json);
    const students = json.students;
    const schoolIds = _.uniq(students.map(student => student.school_id)).sort();
    const rooms = schoolIds.map(schoolId => {
      const roomIndex = schoolIds.indexOf(schoolId);
      return {
        roomKey: `room:${schoolId}`,
        roomName: schoolId,
        roomIndex
      };
    });
    const studentIdsByRoom = _.groupBy(students, student => {
      const roomIndex = schoolIds.indexOf(student.school_id);
      return `room:${roomIndex}`;
    });

    console.log('schoolIds', schoolIds);
    console.log('studentIdsByRoom', studentIdsByRoom);
    debugger
    const {highlightKey} = this.state;
    return (
      <div style={{height: 600}}>
        <ClassroomStats
          students={students}
          gradeLevelNextYear={"3"}
          rooms={rooms.filter(room => room.roomKey !== UNPLACED_ROOM_KEY)}
          studentIdsByRoom={studentIdsByRoom}
          highlightKey={highlightKey}
          onCategorySelected={this.onCategorySelected}
        />
      </div>
    );
  }
}
