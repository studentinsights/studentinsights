import {
  shouldShowLowGradesBox,
  sortSchoolSlugsByGrade,
  studentTableEventNoteTypeIds,
  eventNoteTypeIdsForSearch,
  hasActive504Plan,
  decideStudentProfileTabs
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

    expect(eventNoteTypeIds).toEqual([300, 305, 306, 307, 308]);
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

describe('#eventNoteTypeIdsForSearch', () => {
  it('handles somerville', () => {
    expect(eventNoteTypeIdsForSearch('somerville')).toEqual([300, 301, 302, 304, 305, 306, 307, 308]);
  });

  it('handles new_bedford', () => {
    expect(eventNoteTypeIdsForSearch('new_bedford')).toEqual([400, 300, 302, 304]);
  });

  it('handles beford', () => {
    expect(eventNoteTypeIdsForSearch('bedford')).toEqual([300, 302, 304]);
  });
});

describe('#hasActive504Plan', () => {
  it('works across test cases', () => {
    expect(hasActive504Plan('504')).toEqual(true);
    expect(hasActive504Plan('Active')).toEqual(true);
    expect(hasActive504Plan(null)).toEqual(false);
    expect(hasActive504Plan('Not 504')).toEqual(false);
    expect(hasActive504Plan('NotIn504')).toEqual(false);
    expect(hasActive504Plan('Exited')).toEqual(false);
    expect(hasActive504Plan('unknown')).toEqual(false);
  });
});

describe('#decideStudentProfileTabs', () => {
  it('works across test cases', () => {
    const defaultTabs = {reading: true, math: true};
    expect(decideStudentProfileTabs('somerville', 'ECS')).toEqual(defaultTabs);
    expect(decideStudentProfileTabs('somerville', 'ES')).toEqual(defaultTabs);
    expect(decideStudentProfileTabs('somerville', 'ESMS')).toEqual(defaultTabs);
    expect(decideStudentProfileTabs('somerville', 'MS')).toEqual(defaultTabs);
    expect(decideStudentProfileTabs('somerville', 'HS')).toEqual({grades: true, testing: true});
    expect(decideStudentProfileTabs('somerville', 'OTHER')).toEqual(defaultTabs);
    expect(decideStudentProfileTabs('new_bedford', 'ES')).toEqual({math: true, reading: true});
    expect(decideStudentProfileTabs('new_bedford', 'MS')).toEqual({math: true, reading: true});
    expect(decideStudentProfileTabs('bedford', 'ES')).toEqual(defaultTabs);
    expect(decideStudentProfileTabs('demo', 'ES')).toEqual(defaultTabs);
    expect(decideStudentProfileTabs('demo', 'HS')).toEqual({grades: true, testing: true});
  });
});