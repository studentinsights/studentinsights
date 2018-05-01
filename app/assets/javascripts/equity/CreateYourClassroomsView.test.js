import React from 'react';
import ReactDOM from 'react-dom';
import mockWithFixtures from './fixtures/mockWithFixtures';
import CreateYourClassroomsView, {studentIdsByRoomAfterDrag} from './CreateYourClassroomsView';

beforeEach(() => mockWithFixtures());

function testProps(props = {}) {
  return {
    classroomsCount: 3,
    students: [],
    studentIdsByRoom: {},
    onClassroomListsChanged: jest.fn(),
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(<CreateYourClassroomsView {...props} />, el);
});

describe('studentIdsByRoomAfterDrag', () => {
  it('works on same list', () => {
    const studentIdsByRoom = {
      "room:unplaced": [93,95,96,97,98,99]
    };
    const dragEndResult = {
      "draggableId": "SimpleStudentCard:97",
      "type": "CLASSROOM_LIST",
      "source": {
        "droppableId": "room:unplaced",
        "index": 3
      },
      "destination": {
        "droppableId": "room:unplaced",
        "index": 1
      },
      "reason": "DROP"
    };
    expect(studentIdsByRoomAfterDrag(studentIdsByRoom, dragEndResult)).toEqual({
      "room:unplaced": [93,97,95,96,98,99]
    });
  });
});