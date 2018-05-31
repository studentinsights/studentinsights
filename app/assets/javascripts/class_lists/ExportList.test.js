import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import ExportList from './ExportList';
import {exportPropsWithTeacherNames} from './ClassListCreatorWorkflow.test';


export function testProps(props = {}) {
  const workflowProps = exportPropsWithTeacherNames();
  return {
    ...workflowProps,
    school: {
      name: 'Awesome school'
    },
    teacherStudentIdsByRoom: workflowProps.studentIdsByRoom,
    fetchProfile: function() {},
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(<ExportList {...props} />, el);
});

it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(<ExportList {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
