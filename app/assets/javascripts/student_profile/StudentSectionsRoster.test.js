import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import renderer from 'react-test-renderer';
import StudentSectionsRoster from './StudentSectionsRoster';


export function testProps(props) {
  return {
    includeGrade: true,
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
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<StudentSectionsRoster {...testProps()} />, el);
});

describe('snapshots', () => {
  it('matches defaults', () => {
    const props = testProps();
    expect(renderer.create(<StudentSectionsRoster {...props} />).toJSON()).toMatchSnapshot();
  });

  it('matches includeGrade: false', () => {
    const defaultProps = testProps();
    const props = {
      ...defaultProps,
      sections: defaultProps.sections.map(section => _.omit(section, 'grade_numeric')),
      includeGrade: false
    };
    expect(renderer.create(<StudentSectionsRoster {...props} />).toJSON()).toMatchSnapshot();
  });

  it('matches when no linkableSections', () => {
    const props = testProps({linkableSections: []});
    expect(renderer.create(<StudentSectionsRoster {...props} />).toJSON()).toMatchSnapshot();
  });
});
