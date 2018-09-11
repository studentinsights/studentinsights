// This function handles variations by district so that it works across all districts.
export function hasAnySpecialEducationData(student, maybeIepDocument) {
  if (maybeIepDocument !== null) return true;
  
  const {levelOfNeed, disability, placement} = cleanSpecialEducationValues(student);
  if (levelOfNeed) return true;
  if (disability) return true;
  if (placement) return true;
  if (student.sped_liaison) return true;
  
  return false;
}

// This function handles variations by district so that it works across all districts.
export function prettyIepTextForStudent(student) {
  return prettyIepText(cleanSpecialEducationValues(student));
}

// This function handles variations by district so that it works across all districts.
export function prettyLevelOfNeedText(levelOfNeedValue) {
  switch (levelOfNeedValue) {
  case "Low < 2": return "less than 2 hours / week";
  case "Low >= 2": return "2-5 hours / week";
  case "Moderate": return "6-14 hours / week";
  case "High": return "15+ hours / week";
  default: return null;
  }
}


function prettyIepText({levelOfNeed, disability, placement}) {
  if (placement && disability) return `IEP: ${disability}, ${placement}`;
  if (disability) return `IEP: ${disability}`;
  return 'IEP';
}

function cleanSpecialEducationValues(student) {
  const levelOfNeed = (isNullLevelOfNeed(student.sped_level_of_need))
    ? null
    : student.sped_level_of_need;
  const disability = (isNullDisability(student.disability))
    ? null
    : student.disability;
  const placement = (isNullPlacement(student.sped_placement))
    ? null
    : student.sped_placement;

  return {levelOfNeed, disability, placement};
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