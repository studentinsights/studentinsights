import {
  inExperienceTeam,
  sortSchoolSlugsByGrade,
  slicePanelsDisabilityItems
} from './PerDistrict';

it('#inExperienceTeam', () => {
  expect(inExperienceTeam([])).toEqual(false);
  expect(inExperienceTeam(['foo'])).toEqual(false);
  expect(inExperienceTeam(['foo', 'shs_experience_team'])).toEqual(true);
});

it('#sortSchoolSlugsByGrade', () => {
  expect(['shs', 'whcs'].sort(sortSchoolSlugsByGrade.bind(null, 'somerville'))).toEqual(['whcs', 'shs']);
  expect(['shs', 'whcs'].sort(sortSchoolSlugsByGrade.bind(null, 'other'))).toEqual(['shs', 'whcs']);
});

describe('#slicePanelsDisabilityItems', () => {
  it('works for demo', () => {
    expect(slicePanelsDisabilityItems('demo').map(item => item.value)).toEqual([
      "None",
      "Low < 2",
      "Low >= 2",
      "Moderate",
      "High",
    ]);
  });

  it('works for somerville', () => {
    expect(slicePanelsDisabilityItems('somerville').map(item => item.value)).toEqual([
      "None",
      "Low < 2",
      "Low >= 2",
      "Moderate",
      "High",
    ]);
  });

  it('works for new_bedford', () => {
    expect(slicePanelsDisabilityItems('new_bedford').map(item => item.value)).toEqual([
      "Does Not Apply",
      "Low-Less Than 2hrs/week",
      "Low-2+ hrs/week",
      "Moderate",
      "High"
    ]);
  });
});