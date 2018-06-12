import {
  inExperienceTeam,
  sortSchoolSlugsByGrade
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