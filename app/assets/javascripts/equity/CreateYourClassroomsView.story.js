import React from 'react';
import _ from 'lodash';
import {storiesOf} from '@storybook/react';
import CreateYourClassroomsView from './CreateYourClassroomsView';
import {initialStudentIdsByRoom} from './studentIdsByRoomFunctions';
import storybookFrame from './storybookFrame';
import students_for_grade_level_next_year_json from './fixtures/students_for_grade_level_next_year_json';
import profile_json from './fixtures/profile_json';

function testProps(props) {
  return {
    fetchProfile(studentId) {
      return Promise.resolve(profile_json);
    },
    classroomsCount: 3,
    gradeLevelNextYear: "2",
    students: students_for_grade_level_next_year_json.students,
    ...props
  };
}

storiesOf('equity/CreateYourClassroomsView', module) // eslint-disable-line no-undef
  .add("Next 2rd grade", () => {
    const props = testProps();
    return storybookFrame(<Container {...props} />);
  })
  .add("Next 5th grade", () => {
    const props = testProps({
      gradeLevelNextYear: '5'
    });
    return storybookFrame(<Container {...props} />);
  })
  .add("Many classrooms", () => {
    const props = testProps({
      classroomsCount: 5,
      gradeLevelNextYear: '5'
    });
    return storybookFrame(<Container {...props} />);
  });



// Container for tracking state changes
class Container extends React.Component {
  constructor(props) {
    super(props);
    const {classroomsCount, students} = props;
    const studentIdsByRoom = initialStudentIdsByRoom(classroomsCount, students, {
      placementFn(studentIdsByRoom, student) {
        return _.sample(Object.keys(studentIdsByRoom));
      }
    });

    this.state = {
      studentIdsByRoom
    };
  }

  onClassroomListsChanged(studentIdsByRoom) {
    this.setState({studentIdsByRoom});
  }

  render() {
    const {studentIdsByRoom} = this.state;
    return <CreateYourClassroomsView
      {...this.props}
      studentIdsByRoom={studentIdsByRoom}
      onClassroomListsChanged={this.onClassroomListsChanged.bind(this)} />;
  }
}
Container.propTypes = {
  classroomsCount: React.PropTypes.number.isRequired,
  students: React.PropTypes.array.isRequired
};