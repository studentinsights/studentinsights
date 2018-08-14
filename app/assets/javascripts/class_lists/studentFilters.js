export function isLimitedOrFlep(student) {
  return ['Limited', 'FLEP'].indexOf(student.limited_english_proficiency) !== -1;
}

export function isIepOr504(student) {
  return (student.disability !== null || student.plan_504 === '504');
}

export function isLowIncome(student) {
  return ['Free Lunch', 'Reduced Lunch'].indexOf(student.free_reduced_lunch) !== -1;
}

export function isHighDiscipline(student) {
  return (student.most_recent_school_year_discipline_incidents_count >= 3);
}

export const HighlightKeys = {
  IEP_OR_504: 'IEP_OR_504',
  LIMITED_OR_FLEP: 'LIMITED_OR_FLEP',
  GENDER: 'GENDER',
  LOW_INCOME: 'LOW_INCOME',
  HIGH_DISCIPLINE: 'HIGH_DISCIPLINE',
  STAR_MATH: 'STAR_MATH',
  STAR_READING: 'STAR_READING',
  DIBELS: 'DIBELS'
};

// Bucket STAR percentiles into high/medium/low
export const starBucketThresholds = [0, 0.30, 0.70, 1];
export function starBucket(percentile) {
  if (percentile == null) return null;

  const lowThreshold = 100 * starBucketThresholds[1];
  const highThreshold = 100 * starBucketThresholds[2];
  if (percentile < lowThreshold) return 'low';
  if (percentile > highThreshold) return 'high';
  return 'medium';
}