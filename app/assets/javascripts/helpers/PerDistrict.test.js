import {inExperienceTeam} from './PerDistrict';

it('#inExperienceTeam', () => {
  expect(inExperienceTeam([])).toEqual(false);
  expect(inExperienceTeam(['foo'])).toEqual(false);
  expect(inExperienceTeam(['foo', 'shs_experience_team'])).toEqual(true);
});