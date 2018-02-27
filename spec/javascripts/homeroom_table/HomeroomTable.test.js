import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import SpecSugar from '../support/spec_sugar.jsx';
import HomeroomTable from '../../../app/assets/javascripts/homeroom_table/HomeroomTable.js';
import students from '../fixtures/homeroom_students.jsx';
import {healey, shs} from '../fixtures/schools';


const helpers = {
  testProps(props) {
    return {
      showStar: false,
      showMcas: false,
      rows: students,
      school: healey(),
      ...props
    };
  },

  renderInto(el, props) {
    ReactDOM.render(<HomeroomTable {...props} />, el);
  },

  headerTexts(el) {
    return $(el).find('table thead tr th').toArray().map(el => $(el).text());
  }
};

SpecSugar.withTestEl('high-level integration test', (container) => {
  // Prevent test pollution
  beforeEach(() => Cookies.remove('columnsDisplayed'));

  it('renders the table', () => {

    const props = helpers.testProps();
    const el = container.testEl;
    helpers.renderInto(el, props);

    expect($(el).find('thead > tr').length).toEqual(2);
    expect($(el).find('tbody > tr').length).toEqual(6);
    expect(el.innerHTML).toContain('Aladdin Kenobi');
  });

  it('opens column picker when clicking on column picker toggle ', () => {

    const props = helpers.testProps();
    const el = container.testEl;
    helpers.renderInto(el, props);

    $(el).find('#column-picker-toggle').click();
    expect($(el).find('#column-picker').length).toEqual(1);
  });

  it('able to remove a column when unchecking an item on the column picker menu  ', () => {

    const props = helpers.testProps();
    const el = container.testEl;
    helpers.renderInto(el, props);

    $(el).find('#column-picker-toggle').click();
    const checkbox = $(el).find('input[type=checkbox]').get(0);
    expect($(el).find('span.table-header').length).toEqual(10);
    checkbox.click();
    expect(checkbox.checked).toEqual(false);
    expect($(el).find('span.table-header').length).toEqual(9);
  });

  it('renders correct headers for ESMS school', () => {
    const props = helpers.testProps({
      showMcas: true,
      showStar: true
    });
    const el = container.testEl;
    helpers.renderInto(el, props);
    expect(helpers.headerTexts(el)).toEqual([
      'Name',
      'Risk',
      'Last SST',
      'Last MTSS',
      'Program Assigned',
      'Disability',
      'Level of Need',
      '504 Plan',
      'Fluency',
      'Home Language',
      'Percentile',
      'Percentile',
      'Performance',
      'Score',
      'Performance',
      'Score'
    ]);
  });

  it('renders correct headers for HS school', () => {
    const props = helpers.testProps({ school: shs() });
    const el = container.testEl;
    helpers.renderInto(el, props);
    expect(helpers.headerTexts(el)).toEqual([
      'Name',
      'Risk',
      'Last SST',
      'Last NGE',
      'Last 10GE',
      'Program Assigned',
      'Disability',
      'Level of Need',
      '504 Plan',
      'Fluency',
      'Home Language'
    ]);
  });

  it('closes column picker when clicking close on an opened column picker ', () => {

    const props = helpers.testProps();
    const el = container.testEl;
    helpers.renderInto(el, props);

    $(el).find('#column-picker-toggle').click();
    $(el).find('.close').click();
    expect($(el).find('#column-picker').length).toEqual(0);
  });
});
