import SpecSugar from '../support/spec_sugar.jsx';
import HomeroomTable from '../../../app/assets/javascripts/homeroom_table/HomeroomTable.js';
import students from '../fixtures/homeroom_students.jsx';
import ReactDOM from 'react-dom';

const helpers = {
  renderInto: function(el, props) {
    ReactDOM.render(<HomeroomTable {...props} />, el);
  }
};

SpecSugar.withTestEl('high-level integration test', (container) => {
  it('renders the table', () => {

    const props = {
      showStar: false,
      showMcas: false,
      rows: students
    };

    const el = container.testEl;
    helpers.renderInto(el, props);

    expect(el.innerHTML).toContain('Minnie Poppins');
    expect($(el).find('tr').length).toEqual(15);
  });

  it('opens column picker when clicking on column picker toggle ', () => {

    const props = {
      showStar: false,
      showMcas: false,
      rows: students
    };

    const el = container.testEl;
    helpers.renderInto(el, props);

    $(el).find('#column-picker-toggle').click();
    expect($(el).find('#column-picker').length).toEqual(1);
  });

  it('able to remove a column when unchecking an item on the column picker menu  ', () => {

    const props = {
      showStar: false,
      showMcas: false,
      rows: students
    };

    const el = container.testEl;
    helpers.renderInto(el, props);

    $(el).find('#column-picker-toggle').click();
    const checkbox = $(el).find('input[type=checkbox]').get(0);
    checkbox.click();
    expect(checkbox.checked).toEqual(false);
    expect($(el).find('span.table-header').length).toEqual(7);
  });

  it('closes column picker when clicking close on an opened column picker ', () => {

    const props = {
      showStar: false,
      showMcas: false,
      rows: students
    };

    const el = container.testEl;
    helpers.renderInto(el, props);

    $(el).find('#column-picker-toggle').click();
    $(el).find('.close').click();
    expect($(el).find('#column-picker').length).toEqual(0);
  });
});
