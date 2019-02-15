import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import changeTextValue from '../testing/changeTextValue';
import {
  nowMoment,
  currentEducator
} from './fixtures/fixtures';
import {SOMERVILLE, NEW_BEDFORD, BEDFORD} from '../helpers/PerDistrict';
import PerDistrictContainer from '../components/PerDistrictContainer';
import TakeNotes from './TakeNotes';


export function testProps(props = {}) {
  return {
    nowMoment: nowMoment,
    currentEducator: currentEducator,
    onSave: jest.fn(),
    onCancel: jest.fn(),
    requestState: null,
    ...props
  };
}

function renderTestEl(props = {}, context = {}) {
  const districtKey = context.districtKey || SOMERVILLE;
  const el = document.createElement('div');
  ReactDOM.render(
    <PerDistrictContainer districtKey={districtKey}>
      <TakeNotes {...props} />
    </PerDistrictContainer>
  , el);

  return {el};
}

function buttonTexts(el) {
  return $(el).find('.btn.note-type').toArray().map(el => $(el).text());
}

it('renders without crashing', () => {
  const props = testProps();
  const {el} = renderTestEl(props);

  expect(el.innerHTML).toContain('February 11, 2016');
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
  ReactTestUtils.Simulate.change($(el).find('.TakeNotes-attachment-link-input').get(0), {target: {value: 'https://example.com/foo'}});
  ReactTestUtils.Simulate.click($(el).find('.btn.save').get(0));
  
  expect(props.onSave).toHaveBeenCalledWith({
    "text": "hello!",
    "eventNoteTypeId": 301,
    "eventNoteAttachments": [{
      url: 'https://example.com/foo'
    }]
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
