import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import EdPlansPanel from './EdPlansPanel';

export function testProps(props = {}) {
  return {
    edPlans: [{
      "id": 245,
      "sep_oid": "fake-sep-oid-1",
      "student_id": 104,
      "sep_grade_level": "N",
      "sep_status": "2",
      "sep_effective_date": "2015-09-15",
      "sep_review_date": "2015-10-15",
      "sep_last_meeting_date": null,
      "sep_district_signed_date": null,
      "sep_parent_signed_date": "2015-09-15",
      "sep_end_date": "2015-10-15",
      "sep_last_modified": null,
      "sep_fieldd_001": "These interventions strategies have been in place since 9/15/15 to 10/15/15: Garfield will be allowed to draw a picture on school assignments.",
      "sep_fieldd_002": "",
      "sep_fieldd_003": "",
      "sep_fieldd_004": "Team Members Present:  Rich Districtwide, Laura PrincipalEmail with 504 sent to teachers, guidance counselor, principal on 9/15/15.",
      "sep_fieldd_005": "Category",
      "sep_fieldd_006": "N",
      "sep_fieldd_007": "N",
      "sep_fieldd_008": "N",
      "sep_fieldd_009": "N",
      "sep_fieldd_010": "N",
      "sep_fieldd_011": "N",
      "sep_fieldd_012": "N",
      "sep_fieldd_013": "N",
      "sep_fieldd_014": "N",
      "created_at": "2018-12-08T15:18:53.989Z",
      "updated_at": "2018-12-08T15:18:53.989Z"
    }, {
      "id": 246,
      "sep_oid": "fake-sep-oid-2",
      "student_id": 104,
      "sep_grade_level": "N",
      "sep_status": "4",
      "sep_effective_date": "2015-08-23",
      "sep_review_date": "2015-10-02",
      "sep_last_meeting_date": null,
      "sep_district_signed_date": null,
      "sep_parent_signed_date": null,
      "sep_end_date": "2016-02-22",
      "sep_last_modified": null,
      "sep_fieldd_001": "",
      "sep_fieldd_002": "",
      "sep_fieldd_003": "",
      "sep_fieldd_004": "",
      "sep_fieldd_005": "",
      "sep_fieldd_006": "ADHDGeneral Anxiety Disorder",
      "sep_fieldd_007": "",
      "sep_fieldd_008": "N",
      "sep_fieldd_009": "N",
      "sep_fieldd_010": "N",
      "sep_fieldd_011": "N",
      "sep_fieldd_012": "N",
      "sep_fieldd_013": "N",
      "sep_fieldd_014": "N",
      "created_at": "2018-12-08T15:18:54.007Z",
      "updated_at": "2018-12-08T15:18:54.007Z"
    }]
  };
}

function testEl(props) {
  return <EdPlansPanel {...props} />;
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el);
  return el;
}

it('renders without crashing', () => {
  testRender(testProps());
});

it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(testEl(props))
    .toJSON();
  expect(tree).toMatchSnapshot();
});