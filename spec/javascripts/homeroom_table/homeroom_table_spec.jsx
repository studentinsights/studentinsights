import SpecSugar from '../support/spec_sugar.jsx';
import HomeroomTable from '../../../app/assets/javascripts/homeroom_table/homeroom_table.jsx';
import students from '../fixtures/homeroom_students.jsx';

describe('HomeroomTable', () => {
  const ReactDOM = window.ReactDOM;

  const helpers = {
    renderInto(el, props) {
      ReactDOM.render(<HomeroomTable {...props} />, el);
    }
  };

  SpecSugar.withTestEl('high-level integration test', () => {
    it('renders the table', function () {
      const props = {
        showStar: false,
        showMcas: false,
        rows: students
      };

      const el = this.testEl;
      helpers.renderInto(el, props);

      expect(el).toContainText('Minnie Poppins');
      expect($(el).find('tr').length).toEqual(15);
    });
  });
});
