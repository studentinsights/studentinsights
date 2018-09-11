import {prettyIepTextForStudent} from './specialEducation';



/*
These test cases are sampled across districts from:
students_with_any_sped_bit = Student.active.where('disability IS NOT NULL OR sped_liaison IS NOT NULL OR sped_placement IS NOT NULL OR sped_liaison IS NOT NULL OR sped_level_of_need IS NOT NULL');nil
pp students_with_any_sped_bit.pluck(:sped_level_of_need, :sped_placement, :disability).uniq.map {|x| x.join(",") }.sort;nil
*/
describe('#prettyIepTextForStudent', () => {

  it('works for typical test cases', () => {
    expect(prettyIepTextForStudent({
      sped_placement: '',
      disability: 'Intellectual',
      sped_level_of_need: 'High'
    })).toEqual('IEP: Intellectual');
    expect(prettyIepTextForStudent({
      sped_placement: '',
      disability: 'Communication',
      sped_level_of_need: 'Low < 2'
    })).toEqual('IEP: Communication');
    expect(prettyIepTextForStudent({
      sped_placement: 'Full Inclusion',
      disability: 'Communication',
      sped_level_of_need: 'Low < 2'
    })).toEqual('IEP: Communication, Full Inclusion');
    expect(prettyIepTextForStudent({
      sped_placement: 'Full Inclusion',
      disability: 'Emotional',
      sped_level_of_need: 'High'
    })).toEqual('IEP: Emotional, Full Inclusion');
    expect(prettyIepTextForStudent({
      sped_placement: 'Partial Inclusion',
      disability: 'Specific LDs',
      sped_level_of_need: 'Moderate'
    })).toEqual('IEP: Specific LDs, Partial Inclusion');
    expect(prettyIepTextForStudent({
      sped_placement: 'Public Seperate', // typo in SIS upstream
      disability: 'Specific LDs',
      sped_level_of_need: 'Moderate'
    })).toEqual('IEP: Specific LDs, Public Seperate');
    expect(prettyIepTextForStudent({
      sped_placement: 'Substantially Separate',
      disability: 'Autism',
      sped_level_of_need: 'Moderate'
    })).toEqual('IEP: Autism, Substantially Separate');
    expect(prettyIepTextForStudent({
      sped_placement: 'Public Day',
      disability: 'Health',
      sped_level_of_need: 'High'
    })).toEqual('IEP: Health, Public Day');
    expect(prettyIepTextForStudent({
      sped_placement: 'Not special ed',
      disability: 'Sensory (Hearing)',
      sped_level_of_need: 'Low-2+ hrs/week'
    })).toEqual('IEP: Sensory (Hearing)');
    expect(prettyIepTextForStudent({
      sped_placement: 'Full Inclusion',
      disability: 'Developmental Delay',
      sped_level_of_need: 'Low-Less Than 2hrs/week'
    })).toEqual('IEP: Developmental Delay, Full Inclusion');
    expect(prettyIepTextForStudent({
      sped_placement: 'Substantially Separate',
      disability: 'Multiple Disabilities',
      sped_level_of_need: 'Moderate'
    })).toEqual('IEP: Multiple Disabilities, Substantially Separate');
  });

  it('cuts out "Not special ed" and "Does Not Apply"', () => {
    expect(prettyIepTextForStudent({
      sped_placement: 'Not special ed',
      disability: 'Does Not Apply',
      sped_level_of_need: 'Does Not Apply'
    })).toEqual('IEP');
  });

  it('shows info about "Exited this year"', () => {
    expect(prettyIepTextForStudent({
      sped_placement: 'Exited this year',
      disability: 'Emotional',
      sped_level_of_need: 'High'
    })).toEqual('IEP: Emotional, Exited this year');
  });
});
