// This file contains functions that handle variations by district, so that they work
// across all districts.
export function hasAnySpecialEducationData(student, maybeIepDocument) {
  if (maybeIepDocument) return true;
  
  const {program, placement, disability, levelOfNeed} = cleanSpecialEducationValues(student);
  if (program && isSpecialEducationProgram(program)) return true;
  if (placement) return true;
  if (disability) return true;
  if (levelOfNeed) return true;

  if (student.sped_liaison) return true;
  
  return false;
}

// Always falls back to `IEP` at worst
export function prettyIepTextForSpecialEducationStudent(student) {
  return prettyIepText(cleanSpecialEducationValues(student));
}

export function prettyLevelOfNeedText(levelOfNeedValue) {
  switch (levelOfNeedValue) {
  // somerville
  case 'Low < 2': return 'less than 2 hours / week';
  case 'Low >= 2': return '2-5 hours / week';
  case 'Moderate': return '6-14 hours / week';
  case 'High': return '15+ hours / week';

  // bedford variants
  case 'Low (2 hours or less)': return 'less than 2 hours / week';
  case 'Low (2 or more hours)': return '2-5 hours / week';
  default: return null;
  }
}

// This returns short user-facing text to describe a separate program or placement
// as part of special education or ELL services (the program bit is Somerville-only).
export function prettyProgramOrPlacementText(student) {
  const {program, placement} = cleanSpecialEducationValues(student);
  if (!isNullProgram(program) && (!isSpecialEducationProgram(program) || !placement)) return program;
  if (placement) return placement;
  return null;
}


export function cleanSpecialEducationValues(student) {
  const program = (isNullProgram(student.program_assigned))
    ? null
    : student.program_assigned;
  const levelOfNeed = (isNullLevelOfNeed(student.sped_level_of_need))
    ? null
    : student.sped_level_of_need;
  const disability = (isNullDisability(student.disability))
    ? null
    : student.disability;
  const placement = (isNullPlacement(student.sped_placement))
    ? null
    : student.sped_placement;

  return {program, placement, levelOfNeed, disability};
}

function prettyIepText({levelOfNeed, disability, placement}) {
  if (placement === 'Exited this year') return 'Exited SPED this year';
  if (disability) return `IEP for ${disability}`;
  return 'IEP';
}

// One edge case here is "Exited this year"  This function treats that as
// worth telling the user about, and not a "null" value.
function isNullPlacement(placement) {
  if (['None', 'Not Enrolled', 'Not special ed', null].indexOf(placement) !== -1) return true;
  if (['Not SPED Was Earlier', 'Not Sped Student 6-21'].indexOf(placement) !== -1) return true; // additional Bedford variants
  return false;
}

function isNullDisability(disability) {
  return (['Does Not Apply', null].indexOf(disability) !== -1);
}

function isNullLevelOfNeed(levelOfNeed) {
  return (['Does Not Apply', null].indexOf(levelOfNeed) !== -1);
}

function isNullProgram(program) {
  // Somerville only.  In Someville, educators at SHS asked to remove references to SEIP and Wavered SEIP
  // and to only use the formal LEP designation.  The thought is that this would come off as jargony and
  // confusing to non-ELL teachers, and if it were included in the description of special education, this would
  // be misleading since it may inaccurately suggest these ELL students are involved in special education,
  // and that the program status in the SIS won't be accurate for dually-diagnosed students, who are only coded
  // as SPED for the program.  So these values are excluded here.
  if (['Reg Ed', 'SEIP', 'Wavered SEIP', null].indexOf(program) !== -1) return true;

  if (['Not Enrolled', '(NULL)'].indexOf(program) !== -1) return true; // Bedford
  return false;
}

function isSpecialEducationProgram(program) {
  return (program === 'Sp Ed');
}