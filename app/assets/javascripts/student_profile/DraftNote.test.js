import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import changeTextValue from '../testing/changeTextValue';
import {currentEducator} from './fixtures/fixtures';
import profileJsonForRyanRodriguez from './fixtures/profileJsonForRyanRodriguez.fixture';
import {SOMERVILLE, NEW_BEDFORD, BEDFORD, DEMO} from '../helpers/PerDistrict';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import DraftNote from './DraftNote';


export function testProps(props = {}) {
  return {
    student: profileJsonForRyanRodriguez.student,
    currentEducator: currentEducator,
    onSave: jest.fn(),
    onCancel: jest.fn(),
    requestState: null,
    ...props
  };
}

export function testScenarios() {
  return [
    { labelText: 'New Bedford', contextDiff: {districtKey: NEW_BEDFORD } },
    { labelText: 'Somerville', contextDiff: {districtKey: SOMERVILLE } },
    { labelText: 'Bedford', contextDiff: {districtKey: BEDFORD } },
    { labelText: 'Demo', contextDiff: {districtKey: DEMO } },
    { labelText: 'showRestrictedCheckbox', propsDiff: {showRestrictedCheckbox: true} }
  ];
}

function testEl(props = {}, context = {}) {
  const districtKey = context.districtKey || SOMERVILLE;
  return withDefaultNowContext(
    <PerDistrictContainer districtKey={districtKey}>
      <DraftNote {...props} />
    </PerDistrictContainer>
  );
}

function renderTestEl(props = {}, context = {}) {
  const el = document.createElement('div');
  ReactDOM.render(testEl(props, context), el);
  return {el};
}

function buttonTexts(el) {
  return $(el).find('.btn.note-type').toArray().map(el => $(el).text());
}

it('renders without crashing', () => {
  const props = testProps();
  const {el} = renderTestEl(props);

  expect(el.innerHTML).toContain('right now');
  expect(el.innerHTML).toContain('demo@example.com');
  expect($(el).find('textarea').length).toEqual(1);
  expect($(el).find('.btn.note-type').length).toEqual(8);
  expect($(el).find('.btn.save').length).toEqual(1);
  expect($(el).find('.btn.cancel').length).toEqual(1);
});


it('calls onSave with the correct shape', () => {
  const props = testProps();
  const {el} = renderTestEl(props, { districtKey: SOMERVILLE });

  changeTextValue($(el).find('textarea').get(0), 'hello!');
  ReactTestUtils.Simulate.click($(el).find('.btn.note-type:eq(1)').get(0));
  ReactTestUtils.Simulate.click($(el).find('.btn.save').get(0));
  
  expect(props.onSave).toHaveBeenCalledWith({
    "text": "hello!",
    "eventNoteTypeId": 301,
    "eventNoteAttachments": []
  });
});

it('calls onSave with isRestricted', () => {
  const props = testProps({showRestrictedCheckbox: true});
  const {el} = renderTestEl(props, { districtKey: SOMERVILLE });

  changeTextValue($(el).find('textarea').get(0), 'hello!');
  ReactTestUtils.Simulate.click($(el).find('.btn.note-type:eq(1)').get(0));
  ReactTestUtils.Simulate.click($(el).find('input[type=checkbox]').get(0));
  ReactTestUtils.Simulate.click($(el).find('.btn.save').get(0));
  
  expect(props.onSave).toHaveBeenCalledWith({
    "text": "hello!",
    "eventNoteTypeId": 301,
    "isRestricted": true,
    "eventNoteAttachments": []
  });
});

describe('buttons for taking notes', () => {
  it('works for Somerville', () => {
    const {el} = renderTestEl(testProps(), { districtKey: SOMERVILLE });
    expect(buttonTexts(el)).toEqual([
      'SST Meeting',
      'MTSS Meeting',
      'Parent conversation',
      'Something else',
      '9th Grade Experience',
      '10th Grade Experience',
      'NEST',
      'Counselor Meeting'
    ]);
  });

  it('works for New Bedford', () => {
    const {el} = renderTestEl(testProps(), { districtKey: NEW_BEDFORD });
    expect(buttonTexts(el)).toEqual([
      'BBST Meeting',
      'SST Meeting',
      'Parent conversation',
      'Something else'
    ]);
  });

  it('works for New Bedford', () => {
    const {el} = renderTestEl(testProps(), { districtKey: BEDFORD });
    expect(buttonTexts(el)).toEqual([
      'SST Meeting',
      'Parent conversation',
      'Something else'
    ]);
  });
});

it('showRestrictedCheckbox', () => {
  const props = testProps({showRestrictedCheckbox: true});
  const {el} = renderTestEl(props);

  expect(el.innerHTML).toContain('Restrict access?');
  expect(el.innerHTML).toContain('Yes, note contains private or sensitive personal information');
  const $checkboxEl = $(el).find('input[type=checkbox]');
  expect($checkboxEl.length).toEqual(1);
});

it('snapshots across scenarios', () => {
  expect(renderer.create(testScenarios().map(scenario => (
    <div key={scenario.labelText}>
      <h3>{scenario.labelText}</h3>
      {testEl(testProps(scenario.propsDiff), scenario.contextDiff)}
    </div>
  ))).toJSON()).toMatchSnapshot();
});
