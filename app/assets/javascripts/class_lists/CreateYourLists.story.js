import React from 'react';
import {storiesOf} from '@storybook/react';
import storybookFrame from './storybookFrame';
import {withDefaultNowContext} from '../../../../spec/javascripts/support/NowContainer';
import CreateYourLists from './CreateYourLists';
import {
  UNPLACED_ROOM_KEY,
  roomKeyFromIndex,
  initialStudentIdsByRoom
} from './studentIdsByRoomFunctions';
import {testProps} from './CreateYourLists.test';


storiesOf('equity/CreateYourLists', module) // eslint-disable-line no-undef
  .add("empty", () => {
    return testRender(testProps({ forceUnplaced: true }));
  })
  .add("Next 2rd grade", () => {
    return testRender(testProps());
  })
  .add("Next 5th grade", () => {
    return testRender(testProps({
      classroomsCount: 4,
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
          ? UNPLACED_ROOM_KEY
          : roomKeyFromIndex(JSON.stringify(student).length % classroomsCount);
      }
    });

    this.state = {
      studentIdsByRoom
    };
  }

  onClassListsChanged(studentIdsByRoom) {
    this.setState({studentIdsByRoom});
  }

  render() {
    const {studentIdsByRoom} = this.state;
    return <CreateYourLists
      {...this.props}
      studentIdsByRoom={studentIdsByRoom}
      onClassListsChanged={this.onClassListsChanged.bind(this)} />;
  }
}
Container.propTypes = {
  classroomsCount: React.PropTypes.number.isRequired,
  students: React.PropTypes.array.isRequired,
  forceUnplaced: React.PropTypes.bool
};