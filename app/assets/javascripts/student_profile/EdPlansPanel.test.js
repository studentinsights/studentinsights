import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import EdPlansPanel from './EdPlansPanel';

export function testProps(props = {}) {
  return {
    studentName: 'Garfield Skywalker',
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
      "sep_fieldd_001": "",
      "sep_fieldd_002": "",
      "sep_fieldd_003": "",
      "sep_fieldd_004": "",
      "sep_fieldd_005": "Category",
      "sep_fieldd_006": "Health disability",
      "sep_fieldd_007": "Rich Districtwide, Laura Principal",
      "sep_fieldd_008": "N",
      "sep_fieldd_009": "N",
      "sep_fieldd_010": "N",
      "sep_fieldd_011": "N",
      "sep_fieldd_012": "N",
      "sep_fieldd_013": "N",
      "sep_fieldd_014": "N",
      "created_at": "2018-12-08T15:18:53.989Z",
      "updated_at": "2018-12-08T15:18:53.989Z",
      "ed_plan_accommodations": [{
        "id": 601,
        "ed_plan_id": 245,
        "iac_oid": "fixture-oid-1",
        "iac_sep_oid": "fixture-sep-oid-1",
        "iac_content_area": "All",
        "iac_category": "Non-standard",
        "iac_type": "504",
        "iac_description": "Student will meet with teachers before or after school to find out about any make-up work.",
        "iac_field": "",
        "iac_name": "Other Non-Standard Accommodation",
        "iac_last_modified": "2015-03-06T12:43:14.000Z",
        "created_at": "2015-12-09T13:12:20.255Z",
        "updated_at": "2015-12-09T13:12:20.255Z"
      },
      {
        "id": 602,
        "ed_plan_id": 245,
        "iac_oid": "fixture-oid-2",
        "iac_sep_oid": "fixture-sep-oid-1",
        "iac_content_area": "All",
        "iac_category": "Non-standard",
        "iac_type": "504",
        "iac_description": "Prompt the student to review the work they complete before moving on to the next assignment.",
        "iac_field": "",
        "iac_name": "Other Non-Standard Accommodation",
        "iac_last_modified": "2015-03-06T12:43:14.000Z",
        "created_at": "2018-12-09T13:12:20.928Z",
        "updated_at": "2018-12-09T13:12:20.928Z"
      }]
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
      "sep_fieldd_006": "ADHD, General Anxiety Disorder",
      "sep_fieldd_007": "Marcus Counselor",
      "sep_fieldd_008": "N",
      "sep_fieldd_009": "N",
      "sep_fieldd_010": "N",
      "sep_fieldd_011": "N",
      "sep_fieldd_012": "N",
      "sep_fieldd_013": "N",
      "sep_fieldd_014": "N",
      "created_at": "2018-12-08T15:18:54.007Z",
      "updated_at": "2018-12-08T15:18:54.007Z",
      "ed_plan_accommodations": []
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

describe('when missing data', () => {
  it('works when no accommodations', () => {
    const props = testProps();
    props.edPlans.forEach(edPlan => edPlan.ed_plan_accommodations = []);
    const el = testRender(props);
    expect($(el).text()).toContain('None listed.');
  });

  it('works when no persons responsible', () => {
    const props = testProps();
    props.edPlans.forEach(edPlan => edPlan.sep_fieldd_007 = '');
    const el = testRender(props);
    expect($(el).text()).toContain('None listed.');
  });

  it('works when no specific disability', () => {
    const props = testProps();
    props.edPlans.forEach(edPlan => edPlan.sep_fieldd_006 = '');
    const el = testRender(props);
    expect($(el).text()).toContain('Specific disability: (none)');
  });
});
