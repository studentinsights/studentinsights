export function isLimitedOrFlep(student) {
  return ['Limited', 'FLEP'].indexOf(student.limited_english_proficiency) !== -1;
}

export function isIepOr504(student) {
  return (student.disability !== null || student.plan_504 === '504');
}

export function isLowIncome(student) {
  return ['Free Lunch', 'Reduced Lunch'].indexOf(student.free_reduced_lunch) !== -1;
}
