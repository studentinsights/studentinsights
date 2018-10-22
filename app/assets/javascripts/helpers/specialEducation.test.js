import {
  hasAnySpecialEducationData,
  prettyProgramOrPlacementText,
  prettyIepTextForSpecialEducationStudent
} from './specialEducation';

describe('#hasAnySpecialEducationData', () => {
  it('excludes other programs', () => {
    expect(hasAnySpecialEducationData({
      program_assigned: '2Way English',
      sped_placement: null,
      disability: null,
      sped_level_of_need: null,
    }, null)).toEqual(false);
  });
});

describe('#prettyProgramOrPlacementText', () => {
  it('works', () => {
    expect(prettyProgramOrPlacementText({
      program_assigned: null,
      sped_placement: null
    })).toEqual(null);
    
    expect(prettyProgramOrPlacementText({
      program_assigned: 'Reg Ed',
      sped_placement: null
    })).toEqual(null);
    
    expect(prettyProgramOrPlacementText({
      program_assigned: 'Sp Ed',
      sped_placement: null
    })).toEqual('Sp Ed');

    expect(prettyProgramOrPlacementText({
      program_assigned: 'Sp Ed',
      sped_placement: 'Full Inclusion'
    })).toEqual('Full Inclusion');
    
    expect(prettyProgramOrPlacementText({
      program_assigned: 'SEIP',
      sped_placement: null
    })).toEqual(null);

    expect(prettyProgramOrPlacementText({
      program_assigned: 'Wavered SEIP',
      sped_placement: null
    })).toEqual(null);

    expect(prettyProgramOrPlacementText({
      program_assigned: '2Way Spanish',
      sped_placement: 'foo'
    })).toEqual('2Way Spanish');
  });
});

/*
These test cases are sampled across districts from:
  puts Student.active.select(:program_assigned, :sped_placement, :disability, :sped_level_of_need).as_json.uniq.to_json;nil
*/
describe('#prettyIepTextForSpecialEducationStudent', () => {
  it('works for typical test cases', () => {
    
    expect(prettyIepTextForSpecialEducationStudent({
      program_assigned: null,
      sped_placement: '',
      disability: 'Intellectual',
      sped_level_of_need: 'High'
    })).toEqual('IEP for Intellectual');
    
    expect(prettyIepTextForSpecialEducationStudent({
      program_assigned: null,
      sped_placement: '',
      disability: 'Communication',
      sped_level_of_need: 'Low < 2'
    })).toEqual('IEP for Communication');
    
    expect(prettyIepTextForSpecialEducationStudent({
      program_assigned: null,
      sped_placement: 'Full Inclusion',
      disability: 'Communication',
      sped_level_of_need: 'Low < 2'
    })).toEqual('IEP for Communication');
    
    expect(prettyIepTextForSpecialEducationStudent({
      program_assigned: null,
      sped_placement: 'Full Inclusion',
      disability: 'Emotional',
      sped_level_of_need: 'High'
    })).toEqual('IEP for Emotional');
    
    expect(prettyIepTextForSpecialEducationStudent({
      program_assigned: null,
      sped_placement: 'Partial Inclusion',
      disability: 'Specific LDs',
      sped_level_of_need: 'Moderate'
    })).toEqual('IEP for Specific LDs');
    
    expect(prettyIepTextForSpecialEducationStudent({
      program_assigned: null,
      sped_placement: 'Public Seperate', // typo in SIS upstream
      disability: 'Specific LDs',
      sped_level_of_need: 'Moderate'
    })).toEqual('IEP for Specific LDs');
    
    expect(prettyIepTextForSpecialEducationStudent({
      program_assigned: null,
      sped_placement: 'Substantially Separate',
      disability: 'Autism',
      sped_level_of_need: 'Moderate'
    })).toEqual('IEP for Autism');
    
    expect(prettyIepTextForSpecialEducationStudent({
      program_assigned: null,
      sped_placement: 'Public Day',
      disability: 'Health',
      sped_level_of_need: 'High'
    })).toEqual('IEP for Health');
    
    expect(prettyIepTextForSpecialEducationStudent({
      program_assigned: null,
      sped_placement: 'Not special ed',
      disability: 'Sensory (Hearing)',
      sped_level_of_need: 'Low-2+ hrs/week'
    })).toEqual('IEP for Sensory (Hearing)');
    
    expect(prettyIepTextForSpecialEducationStudent({
      program_assigned: null,
      sped_placement: 'Full Inclusion',
      disability: 'Developmental Delay',
      sped_level_of_need: 'Low-Less Than 2hrs/week'
    })).toEqual('IEP for Developmental Delay');
    
    expect(prettyIepTextForSpecialEducationStudent({
      program_assigned: null,
      sped_placement: 'Substantially Separate',
      disability: 'Multiple Disabilities',
      sped_level_of_need: 'Moderate'
    })).toEqual('IEP for Multiple Disabilities');
  });

  it('shows generic IEP for "Not special ed" and "Does Not Apply"', () => {
    expect(prettyIepTextForSpecialEducationStudent({
      program_assigned: null,
      sped_placement: 'Not special ed',
      disability: 'Does Not Apply',
      sped_level_of_need: 'Does Not Apply'
    })).toEqual('IEP');
  });

  it('shows info about "Exited this year"', () => {
    expect(prettyIepTextForSpecialEducationStudent({
      program_assigned: null,
      sped_placement: 'Exited this year',
      disability: 'Emotional',
      sped_level_of_need: 'High'
    })).toEqual('Exited SPED this year');
  });

  it('always show fallback IEP text even if mistakenly called for non-special ed program assignment', () => {
    expect(prettyIepTextForSpecialEducationStudent({
      program_assigned: '2Way English',
      sped_placement: null,
      disability: null,
      sped_level_of_need: null,
    })).toEqual('IEP');
  });
});
