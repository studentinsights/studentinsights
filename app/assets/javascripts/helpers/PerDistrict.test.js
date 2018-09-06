import {
  shouldShowLowGradesBox,
  sortSchoolSlugsByGrade,
  studentTableEventNoteTypeIds
} from './PerDistrict';

it('#shouldShowLowGradesBox', () => {
  expect(shouldShowLowGradesBox([])).toEqual(false);
  expect(shouldShowLowGradesBox(['foo'])).toEqual(false);
  expect(shouldShowLowGradesBox(['foo', 'should_show_low_grades_box'])).toEqual(true);
});

it('#sortSchoolSlugsByGrade', () => {
  expect(['shs', 'whcs'].sort(sortSchoolSlugsByGrade.bind(null, 'somerville'))).toEqual(['whcs', 'shs']);
  expect(['shs', 'whcs'].sort(sortSchoolSlugsByGrade.bind(null, 'other'))).toEqual(['shs', 'whcs']);
});

describe('#studentTableEventNoteTypeIds', () => {
  it('handles somerville HS correctly', () => {
    const eventNoteTypeIds = studentTableEventNoteTypeIds('somerville', 'HS');

    expect(eventNoteTypeIds).toEqual([300, 305, 306]);
  });
  it('handles somerville elementary school correctly', () => {
    const eventNoteTypeIds = studentTableEventNoteTypeIds('somerville', 'ESMS');

    expect(eventNoteTypeIds).toEqual([300, 301]);
  });
  it('handles somerville Capuano early childhood center correctly', () => {
    const eventNoteTypeIds = studentTableEventNoteTypeIds('somerville', null);

    expect(eventNoteTypeIds).toEqual([300, 301]);
  });
});