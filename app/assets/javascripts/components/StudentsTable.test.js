import React from 'react';
import ReactDOM from 'react-dom';
import StudentsTable from './StudentsTable';
import studentsFixture from '../../../../spec/javascripts/fixtures/schools_overview_students';

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

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(<StudentsTable {...props} />, el);
  return {el};
}

function tableHeaderTexts(el) {
  return $(el).find('.StudentsTable thead tr th').toArray().map(el => $(el).text().trim());
}

describe('high-level integration test', () => {
  it('happy path for K8', () => { 
    const props = testProps();
    const {el} = testRender(props);

    expect($(el).find('.StudentsTable tbody tr').length).toEqual(21);
    expect(tableHeaderTexts(el)).toEqual([
      "Name",
      "LastSST",
      "LastMTSS",
      "Grade",
      "Homeroom",
      "Disability",
      "LowIncome",
      "LEP",
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

  it('happy path for HS', () => {
    const props = testProps({
      school: {
        local_id: 'SHS',
        school_type: 'HS'
      }
    });
    const {el} = testRender(props);

    expect($(el).find('.StudentsTable tbody tr').length).toEqual(21);
    expect(tableHeaderTexts(el)).toEqual([
      "Name",
      "LastSST",
      "LastNGE", // also has NGE
      "Last10GE", // also has 10GE
      "Grade",
      "House",
      "Counselor",
      "Homeroom",
      "Disability",
      "LowIncome",
      "LEP",
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

    expect(el.innerHTML).toContain('11/28/10');
    expect(el.innerHTML).not.toContain('11/30/10');
  });
});
