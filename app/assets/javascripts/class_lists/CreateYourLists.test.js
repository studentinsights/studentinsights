import React from 'react';
import ReactDOM from 'react-dom';
import mockWithFixtures from './fixtures/mockWithFixtures';
import CreateYourLists, {studentIdsByRoomAfterDrag} from './CreateYourLists';
import students_for_grade_level_next_year_json from './fixtures/students_for_grade_level_next_year_json';
import profile_json from './fixtures/profile_json';

beforeEach(() => mockWithFixtures());

export function testProps(props = {}) {
  return {
    classroomsCount: 3,
    gradeLevelNextYear: '2',
    students: students_for_grade_level_next_year_json.students,
    studentIdsByRoom: {},
    fetchProfile(studentId) { return Promise.resolve(profile_json); },
    onClassListsChanged: jest.fn(),
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(<CreateYourLists {...props} />, el);
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