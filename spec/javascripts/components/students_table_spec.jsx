import SpecSugar from '../support/spec_sugar.jsx';
import StudentsTable from '../../../app/assets/javascripts/components/students_table.jsx';

describe('StudentsTable', function() {
  const ReactDOM = window.ReactDOM;

  const helpers = {
    renderInto: function(el, props) {
      ReactDOM.render(<StudentsTable {...props} />, el);
    }
  };

  SpecSugar.withTestEl('high-level integration test', function(container) {
    it('renders the right date', function() {

      const props = {
        students: [
          { event_notes:
          [
            { "recorded_at": "2010-11-30T00:00:00.000Z",
              "event_note_type_id": 301 },
            { "recorded_at": "2010-11-28T00:00:00.000Z",
              "event_note_type_id": 300 }
          ],
            active_services: [],
            id: '1'
          }
        ],
        school: { }
      };

      const el = container.testEl;
      helpers.renderInto(el, props);

      expect(el.innerHTML).toContain('11/28/10');
      expect(el.innerHTML).not.toContain('11/30/10');
    });
  });

});
