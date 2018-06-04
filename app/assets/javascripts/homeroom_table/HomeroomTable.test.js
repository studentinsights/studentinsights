import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import Cookies from 'js-cookie';
import HomeroomTable from './HomeroomTable';
import {students} from './HomeroomTable.fixtures';
import {healey, shs} from '../../../../spec/javascripts/fixtures/schools';


function testProps(props = {}) {
  return {
    showStar: false,
    showMcas: false,
    rows: students,
    school: healey(),
    ...props
  };
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(<HomeroomTable {...props} />, el);
  return {el};
}

function headerTexts(el) {
  return $(el).find('table thead tr th').toArray().map(el => $(el).text());
}

describe('high-level integration test', () => {
  // Prevent test pollution
  beforeEach(() => Cookies.remove('columnsDisplayed'));

  it('renders the table', () => {

    const {el} = testRender(testProps());

    expect($(el).find('thead > tr').length).toEqual(2);
    expect($(el).find('tbody > tr').length).toEqual(6);
    expect(el.innerHTML).toContain('Aladdin Kenobi');
  });

  it('opens column picker when clicking on column picker toggle ', () => {

    const {el} = testRender(testProps());

    ReactTestUtils.Simulate.click($(el).find('#column-picker-toggle').get(0));
    expect($(el).find('#column-picker').length).toEqual(1);
  });

  it('able to remove a column when unchecking an item on the column picker menu  ', () => {

    const {el} = testRender(testProps());

    ReactTestUtils.Simulate.click($(el).find('#column-picker-toggle').get(0));
    expect($(el).find('span.table-header').length).toEqual(10);
    ReactTestUtils.Simulate.click($(el).find('input[type=checkbox]').get(0));
    expect($(el).find('span.table-header').length).toEqual(9);
  });

  it('renders correct headers for ESMS school', () => {
    const {el} = testRender(testProps({
      showMcas: true,
      showStar: true
    }));
    expect(headerTexts(el)).toEqual([
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
    const {el} = testRender(testProps({ school: shs() }));
    expect(headerTexts(el)).toEqual([
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

    const {el} = testRender(testProps());

    $(el).find('#column-picker-toggle').click();
    $(el).find('.close').click();
    expect($(el).find('#column-picker').length).toEqual(0);
  });
});
