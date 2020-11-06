import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import _ from 'lodash';
import * as Virtualized from 'react-virtualized';
import {withDefaultNowContext} from '../testing/NowContainer';
import unvirtualize from '../testing/unvirtualize';
import StudentConnectionsTable, {orderedStudents} from './StudentConnectionsTable';
import connectionsShowJson from './connectionsShowJson.fixture';
import PerDistrictContainer from '../components/PerDistrictContainer';
const {SortDirection} = Virtualized;


// can't add snapshots with react-virtualized without
// some work, see https://github.com/bvaughn/react-virtualized/issues/1117
// instead, we stub these implementations with naive simple unvirtualized
// ones, to verify the substance of the rendering works
jest.mock('react-virtualized');
unvirtualize(Virtualized, jest.fn);


function testProps(props = {}) {
  return {
    orderedStudentsWith2020Surveys: connectionsShowJson.students_with_2020_survey_data,
    sortBy: 'grade',
    sortDirection: SortDirection.ASC,
    onTableSort: jest.fn(),
    ...props
  };
}

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(
    <PerDistrictContainer districtKey="somerville">
      <StudentConnectionsTable {...props} />
    </PerDistrictContainer>
  ), el);
  expect($(el).find('.StudentConnectionsTable').length).toEqual(1);
});

describe('orderedStudents', () => {
  it('works', () => {
    const filteredStudents = connectionsShowJson.students_with_2020_survey_data;
    const orderedStudentsList = orderedStudents(filteredStudents, 'science', SortDirection.ASC);
    const orderedGrades = _.compact(_.flatten(orderedStudentsList.map(student => {
      return student.student_section_assignments_right_now.filter(assignment => {
        return assignment.section.id == 4;
      }).map(assignment => assignment.grade_letter);
    })));
    expect(orderedGrades).toEqual(['D', 'D', 'C', 'D']);
  });
});


it('snapshots with unvirtualized render', () => {
  const props = testProps();
  const tree = renderer
    .create(withDefaultNowContext(
      <PerDistrictContainer districtKey="somerville">
      <StudentConnectionsTable {...props} />
      </PerDistrictContainer>))
    .toJSON();
  expect(tree).toMatchSnapshot();
});
