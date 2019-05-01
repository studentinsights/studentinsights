import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../testing/NowContainer';
import mockWithFixtures from './fixtures/mockWithFixtures';
import CreateYourLists, {studentIdsByRoomAfterDrag} from './CreateYourLists';
import students_for_grade_level_next_year_json from './fixtures/students_for_grade_level_next_year_json';
import profile_json from './fixtures/profile_json';

beforeEach(() => mockWithFixtures());

export function testProps(props = {}) {
  return {
    isEditable: true,
    isExpandedVertically: false,
    classroomsCount: 3,
    gradeLevelNextYear: '2',
    students: students_for_grade_level_next_year_json.students,
    studentIdsByRoom: {},
    fetchProfile(studentId) { return Promise.resolve(profile_json); },
    onClassListsChanged: jest.fn(),
    onExpandVerticallyToggled: jest.fn(),
    ...props
  };
}

function snapshotWithProps(propsDiff = {}) {
  const props = testProps(propsDiff);
  return renderer
    .create(withDefaultNowContext(<CreateYourLists {...props} />))
    .toJSON();
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
      "draggableId": "StudentCard:97",
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

describe('snapshots', () => {
  it('empty, readonly', () => expect(snapshotWithProps({forceUnplaced: true, isEditable: true})).toMatchSnapshot());  

  // Other tests lead to this error from react-beautiful-dnd 11.0.2, and I have been unsuccessful in figuring out why.
  // I also can't reproduce the problem in dev or in a story.
  /*
   Uncaught [Error: Invariant failed: provided.innerRef has not been provided with a HTMLElement.

  You can find a guide on using the innerRef callback functions at:
  https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/using-inner-ref.md
  */
});
