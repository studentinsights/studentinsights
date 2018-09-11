// This function handles variations by district so that it works across all districts.
export function hasAnySpecialEducationData(student, maybeIepDocument) {
  if (maybeIepDocument !== null) return true;
  if (['Does Not Apply', null].indexOf(student.sped_level_of_need) === -1) return true;
  if (['Does Not Apply', null].indexOf(student.disability) === -1) return true;
  if (['None', 'Not Enrolled', 'Not special ed', null].indexOf(student.sped_placement) === -1) return true;
  if (student.sped_liaison !== null) return true;
  
  return false;
}

export function renderSpecialEducationText({levelOfNeed, disability, placement}) {
  if (disability) return `IEP for ${disability}`;
  return 'IEP';
}

export function cleanSpecialEducationValues(student) {
  const levelOfNeed = (['Does Not Apply', null].indexOf(student.sped_level_of_need) === -1)
    ? student.sped_level_of_need
    : null;
  const disability = (['Does Not Apply', null].indexOf(student.disability) === -1)
    ? student.disability
    : null;
  const placement = (['None', 'Not Enrolled', 'Not special ed', null].indexOf(student.sped_placement) === -1)
    ? student.sped_placement
    : null;

  return {levelOfNeed, disability, placement};
}


export function renderSpedHoursText(levelOfNeedValue) {
  switch (levelOfNeedValue) {
  case "Low < 2": return "less than 2 hours / week";
  case "Low >= 2": return "2-5 hours / week";
  case "Moderate": return "6-14 hours / week";
  case "High": return "15+ hours / week";
  default: return null;
  }
}