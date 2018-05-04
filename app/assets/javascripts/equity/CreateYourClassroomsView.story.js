import React from 'react';
import _ from 'lodash';
import {storiesOf} from '@storybook/react';
import storybookFrame from './storybookFrame';
import {withDefaultNowContext} from '../../../../spec/javascripts/support/NowContainer';
import CreateYourClassroomsView from './CreateYourClassroomsView';
import {initialStudentIdsByRoom} from './studentIdsByRoomFunctions';
import {testProps} from './CreateYourClassroomsView.test';


storiesOf('equity/CreateYourClassroomsView', module) // eslint-disable-line no-undef
  .add("empty", () => {
    return testRender(testProps({ forceUnplaced: true }));
  })
  .add("Next 2rd grade", () => {
    return testRender(testProps());
  })
  .add("Next 5th grade", () => {
    return testRender(testProps({
      gradeLevelNextYear: '5'
    }));
  })
  .add("Many classrooms", () => {
    return testRender(testProps({
      classroomsCount: 5,
      gradeLevelNextYear: '5'
    }));
  });


function testRender(props = {}) {
  return storybookFrame(withDefaultNowContext(<Container {...props} />));
}


// Container for tracking state changes
class Container extends React.Component {
  constructor(props) {
    super(props);
    const {classroomsCount, students, forceUnplaced} = props;
    const studentIdsByRoom = initialStudentIdsByRoom(classroomsCount, students, {
      placementFn(studentIdsByRoom, student) {
        return (forceUnplaced)
          ? 'room:unplaced'
          : _.sample(Object.keys(studentIdsByRoom));
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
  students: React.PropTypes.array.isRequired,
  forceUnplaced: React.PropTypes.bool
};