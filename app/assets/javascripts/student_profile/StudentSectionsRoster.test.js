import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import StudentSectionsRoster from './StudentSectionsRoster';


export function testProps(props) {
  return {
    linkableSections: [1,2,3,4,5,6],
    sections: [{
      "id":6,
      "section_number":"SCI-201B",
      "term_local_id":"S1",
      "schedule":"5(M,W,F)",
      "room_number":"306W",
      "created_at":"2018-07-23T22:14:24.365Z",
      "updated_at":"2018-07-23T22:14:24.365Z",
      "course_id":3,
      "grade_numeric":"60.0",
      "course_description":"PHYSICS 1",
      "educators":[{"full_name":"Teacher, Fatima"}],
    }, {
      "id":7,
      "section_number":"BIO-302",
      "term_local_id":"9",
      "schedule":"5(M,W,F)",
      "room_number":"206W",
      "created_at":"2018-07-23T22:14:24.365Z",
      "updated_at":"2018-07-23T22:14:24.365Z",
      "course_id":5,
      "grade_numeric":"75.0",
      "course_description":"BIOLOGY 1",
      "educators":[{"full_name":"Teacher, Bill"}],
    }],
    text: "hello",
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<StudentSectionsRoster {...testProps()} />, el);
});

it('snapshots view', () => {
  const tree = renderer
    .create(<StudentSectionsRoster {...testProps()} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});