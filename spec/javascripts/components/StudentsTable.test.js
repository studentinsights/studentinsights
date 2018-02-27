import ReactDOM from 'react-dom';
import SpecSugar from '../support/spec_sugar.jsx';
import StudentsTable from '../../../app/assets/javascripts/components/StudentsTable';
import studentsFixture from '../../../spec/javascripts/fixtures/schools_overview_students.jsx';

const helpers = {
  testProps(props) {
    return {
      students: studentsFixture,
      school: {
        local_id: 'HEA',
        school_type: 'ESMS'
      },
      ...props,
    };
  },
  renderInto: function(el, props) {
    ReactDOM.render(<StudentsTable {...props} />, el);
  },
  tableHeaderTexts(el) {
    return $(el).find('.StudentsTable thead tr th').toArray().map(el => $(el).text().trim());
  }
};

SpecSugar.withTestEl('high-level integration test', function(container) {
  it('happy path for K8', () => {
    const props = helpers.testProps();
    const el = container.testEl;
    helpers.renderInto(el, props);

    expect($(el).find('.StudentsTable tbody tr').length).toEqual(21);
    expect(helpers.tableHeaderTexts(el)).toEqual([
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
    const props = helpers.testProps({
      school: {
        local_id: 'SHS',
        school_type: 'HS'
      }
    });
    const el = container.testEl;
    helpers.renderInto(el, props);

    expect($(el).find('.StudentsTable tbody tr').length).toEqual(21);
    expect(helpers.tableHeaderTexts(el)).toEqual([
      "Name",
      "LastSST",
      "LastMTSS",
      "LastNGE", // also has NGE
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


  it('renders the right date', function() {
    const props = helpers.testProps({
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

    const el = container.testEl;
    helpers.renderInto(el, props);

    expect(el.innerHTML).toContain('11/28/10');
    expect(el.innerHTML).not.toContain('11/30/10');
  });
});
