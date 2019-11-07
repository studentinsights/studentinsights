import React from 'react';
import ReactDOM from 'react-dom';
import {SOMERVILLE} from '../helpers/PerDistrict';
import PerDistrictContainer from '../components/PerDistrictContainer';
import StudentsTable from './StudentsTable';
import studentsFixture from './schoolOverviewStudents.fixture';

function testProps(props = {}) {
  return {
    students: studentsFixture,
    school: {
      local_id: 'HEA',
      school_type: 'ESMS'
    },
    ...props,
  };
}

function testRender(props, context = {}) {
  const districtKey = context.districtKey || SOMERVILLE;
  const el = document.createElement('div');
  ReactDOM.render(
    <PerDistrictContainer districtKey={districtKey}>
      <StudentsTable {...props} />
    </PerDistrictContainer>
    , el);
  return {el};
}

function tableHeaderTexts(el) {
  return $(el).find('.StudentsTable thead tr th').toArray().map(el => $(el).text().trim());
}

describe('high-level integration test', () => {
  it('happy path for Somerville K8', () => { 
    const props = testProps();
    const {el} = testRender(props);

    expect($(el).find('.StudentsTable tbody tr').length).toEqual(25);
    expect(tableHeaderTexts(el)).toEqual([
      "Name",
      "LastSST",
      "LastMTSS",
      "Grade",
      "Homeroom",
      "504plan",
      "SPEDlevel",
      "EnglishLearner",
      "STARReading",
      "MCASELA",
      "STARMath",
      "MCASMath",
      "DisciplineIncidents",
      "Absences",
      "Tardies",
      "Services",
      "Program"      
    ]);
  });

  it('happy path for Somerville HS', () => {
    const props = testProps({
      school: {
        local_id: 'SHS',
        school_type: 'HS'
      }
    });
    const {el} = testRender(props);

    expect($(el).find('.StudentsTable tbody tr').length).toEqual(25);
    expect(tableHeaderTexts(el)).toEqual([
      "Name",
      "LastSST",
      "LastNGE", // also has NGE
      "Last10GE", // also has 10GE
      "LastNEST", // also has NEST
      'LastCounselor', // also counselor meeting
      "Grade",
      "House",
      "Counselor",
      "Homeroom",
      "504plan",
      "SPEDlevel",
      "EnglishLearner",
      "STARReading",
      "MCASELA",
      "STARMath",
      "MCASMath",
      "DisciplineIncidents",
      "Absences",
      "Tardies",
      "Services",
      "Program"
    ]);
  });

  it('happy path for New Bedford', () => {
    const props = testProps();
    const {el} = testRender(props, {districtKey: 'new_bedford'});
    expect($(el).find('.StudentsTable tbody tr').length).toEqual(25);
    expect(tableHeaderTexts(el)).toEqual([
      "Name",
      "LastBBST",
      "LastSST",
      "Grade",
      "Homeroom",
      "504plan",
      "SPEDlevel",
      "EnglishLearner",
      "STARReading",
      "MCASELA",
      "STARMath",
      "MCASMath",
      "DisciplineIncidents",
      "Absences",
      "Tardies",
      "Services",
      "Program"
    ]);
  });

  it('happy path for Bedford', () => {
    const props = testProps();
    const {el} = testRender(props, {districtKey: 'bedford'});
    expect($(el).find('.StudentsTable tbody tr').length).toEqual(25);
    expect(tableHeaderTexts(el)).toEqual([
      "Name",
      "LastSST",
      "LastParent",
      "LastOther",
      "Grade",
      "Homeroom",
      "504plan",
      "SPEDlevel",
      "EnglishLearner",
      "STARReading", // should remove, but haven't yet
      "MCASELA",
      "STARMath", // should remove, but haven't yet
      "MCASMath",
      "DisciplineIncidents",
      "Absences",
      "Tardies",
      "Services",
      "Program"
    ]);
  });


  it('renders the right date', () => {
    const props = testProps({
      students: [
        { event_notes:
        [
          { "recorded_at": "2010-11-30T00:00:00.000Z",
            "event_note_type_id": 399 },
          { "recorded_at": "2010-11-28T00:00:00.000Z",
            "event_note_type_id": 300 }
        ],
        active_services: [],
        id: '1'
        }
      ],
    });
    const {el} = testRender(props);

    expect(el.textContent).toContain('11/28/10');
    expect(el.textContent).not.toContain('11/30/10');
  });
});
