// This file contains functions that handle variations by district, so that they work
// across all districts.
export function hasAnySpecialEducationData(student, maybeIepDocument) {
  if (maybeIepDocument) return true;
  
  const {program, placement, disability, levelOfNeed} = cleanSpecialEducationValues(student);
  if (program) return true;
  if (placement) return true;
  if (disability) return true;
  if (levelOfNeed) return true;

  if (student.sped_liaison) return true;
  
  return false;
}

export function prettyIepTextForStudent(student) {
  return prettyIepText(cleanSpecialEducationValues(student));
}

export function prettyLevelOfNeedText(levelOfNeedValue) {
  switch (levelOfNeedValue) {
  case 'Low < 2': return 'less than 2 hours / week';
  case 'Low >= 2': return '2-5 hours / week';
  case 'Moderate': return '6-14 hours / week';
  case 'High': return '15+ hours / week';
  default: return null;
  }
}

// This returns short user-facing text to describe a separate program or placement
// as part of special education or ELL services (the program bit is Somerville-only).
export function prettyProgramOrPlacementText(student) {
  const {program, placement} = cleanSpecialEducationValues(student);
  if (program && (program !== 'Sp Ed' || !placement)) return program;
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

function isNullPlacement(placement) {
  return (['None', 'Not Enrolled', 'Not special ed', null].indexOf(placement) !== -1);
}

function isNullDisability(disability) {
  return (['Does Not Apply', null].indexOf(disability) !== -1);
}

function isNullLevelOfNeed(levelOfNeed) {
  return (['Does Not Apply', null].indexOf(levelOfNeed) !== -1);
}

// This field is only used in Somerville
function isNullProgram(program) {
  return (['Reg Ed', null].indexOf(program) !== -1);
}
