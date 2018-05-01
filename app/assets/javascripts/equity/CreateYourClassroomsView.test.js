import React from 'react';
import ReactDOM from 'react-dom';
import mockWithFixtures from './fixtures/mockWithFixtures';
import CreateYourClassroomsView from './CreateYourClassroomsView';

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
