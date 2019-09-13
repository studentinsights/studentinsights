import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import BedfordTransitionSubstanceForProfile from './BedfordTransitionSubstanceForProfile';


export function testProps(props = {}) {
  return {
    studentFirstName: 'Garfield',
    importedForm: {
      "id": 3,
      "student_id": 1,
      "form_timestamp": "2018-03-13T11:03:00.000Z",
      "form_key": "bedford_end_of_year_transition_one",
      "form_json": {
        "LLI": "yes",
        "Reading Intervention (w/ specialist)": null,
        "Math Intervention (w/ consult from SD)": "yes",
        "Please share any specific information you want the teacher to know beyond the report card. This could include notes on interventions, strategies, academic updates that aren't documented in an IEP or 504. If information is in a file please be sure to link it here or share w/ Jess via google doc folder or paper copy": "Nov- Dec: 3x30 1:4 pull out Reading group (PA and fundations)",
        "Is there any key information that you wish you knew about this student in September?": null,
        "Please share anything that helped you connect with this student that might be helpful to the next teacher.": "Garfield enjoyed sharing special time reading together for a few minutes at the end of the day."
      },
      "educator_id": 2,
      "created_at": "2019-05-30T17:09:26.029Z",
      "updated_at": "2019-05-30T17:25:17.623Z",
      "educator": {
        "id": 2,
        "email": "vivian@demo.studentinsights.org",
        "full_name": "Teacher, Vivian"
      }
    },
    ...props
  };
}


function testEl(props = {}) {
  return <BedfordTransitionSubstanceForProfile {...props} />;
}


it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(testEl(props), el);
});

it('snapshots view', () => {
  const props = testProps();
  const tree = renderer
    .create(testEl(props))
    .toJSON();
  expect(tree).toMatchSnapshot();
});
