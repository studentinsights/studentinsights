import React from 'react';
import ReactDOM from 'react-dom';
import {SOMERVILLE, NEW_BEDFORD} from '../helpers/PerDistrict';
import PerDistrictContainer from '../components/PerDistrictContainer';
import HomeroomTable from './HomeroomTable';
import {healey, shs, students} from './HomeroomTable.fixtures';


function testProps(props = {}) {
  return {
    grade: '1',
    rows: students,
    school: healey(),
    ...props
  };
}

function testRender(props = {}, context = {}) {
  const districtKey = context.districtKey || SOMERVILLE;
  const el = document.createElement('div');
  ReactDOM.render(
    <PerDistrictContainer districtKey={districtKey}>
      <HomeroomTable {...props} />
    </PerDistrictContainer>
  , el);
  return {el};
}

function headerTexts(el) {
  return $(el).find('table thead tr th').toArray().map(el => $(el).text());
}

function sstAndMtssDateTexts(el) {
  return $(el).find('table tbody tr').toArray().map(el => {
    return $(el).find('td').toArray().slice(0, 4).map(el => $(el).text());
  });
}

describe('high-level integration test', () => {

  it('renders the table', () => {
    const {el} = testRender(testProps());

    expect($(el).find('thead > tr').length).toEqual(2);
    expect($(el).find('tbody > tr').length).toEqual(6);
    expect(el.innerHTML).toContain('Aladdin Kenobi');
  });

  it('renders SST and MTSS dates correctly for Somerville grade 2 as a happy path test case', () => {
    const {el} = testRender(testProps());
    expect(sstAndMtssDateTexts(el)).toEqual([
      ["Duck, Rapunzel", "", "1/2/11", '8/6/11'],
      ["Kenobi, Aladdin", "", "—", '—'],
      ["Kenobi, Snow", "", "8/29/11", '7/27/11'],
      ["Pan, Chip", "", "2/16/11", '—'],
      ["Poppins, Pluto", "", "9/2/11", '6/5/11'],
      ["Skywalker, Snow", "", "10/31/10", '—'],
    ]);
  });

  it('renders correct headers for Somerville grade 2', () => {
    const {el} = testRender(testProps());
    expect(headerTexts(el)).toEqual([
      'Name',
      'Photo',
      'Last SST',
      'Last MTSS',
      'Program Assigned',
      'Disability',
      'Level of Need',
      '504 Plan',
      'Fluency',
      'Home Language'
    ]);
  });

  it('renders correct headers for New Bedford grade 6', () => {
    const props = testProps({ grade: '6'});
    const context = { districtKey: NEW_BEDFORD };
    const {el} = testRender(props, context);
    expect(headerTexts(el)).toEqual([
      'Name',
      'Last BBST',
      'Program Assigned',
      'Disability',
      'Level of Need',
      '504 Plan',
      'Fluency',
      'Home Language',
    ]);
  });

  it('renders correct headers for Somerville grade 6', () => {
    const {el} = testRender(testProps({ grade: '6'}));
    expect(headerTexts(el)).toEqual([
      'Name',
      'Photo',
      'Last SST',
      'Last MTSS',
      'Program Assigned',
      'Disability',
      'Level of Need',
      '504 Plan',
      'Fluency',
      'Home Language',
    ]);
  });

  it('renders correct headers for Somerville HS', () => {
    const {el} = testRender(testProps({ school: shs() }));
    expect(headerTexts(el)).toEqual([
      'Name',
      'Photo',
      'Last SST',
      'Last NGE',
      'Last 10GE',
      'Last NEST',
      'Program Assigned',
      'Disability',
      'Level of Need',
      '504 Plan',
      'Fluency',
      'Home Language'
    ]);
  });
});
