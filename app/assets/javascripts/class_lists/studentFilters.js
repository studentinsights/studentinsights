import _ from 'lodash';
import qs from 'query-string';


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

export function countDiversityPoints(studentsInRoom, allStudents) {
  const diversityIndex = uniqueIntersectionsCount(studentsInRoom) / uniqueIntersectionsCount(allStudents);
  console.log('unique intersections overall:', _.uniqWith(intersectionsFor(allStudents), _.isEqual).sort());
  return Math.round(100 * diversityIndex);
}

function uniqueIntersectionsCount(students) {
  const intersections = students.map(intersectionsFor);
  return _.uniqWith(intersections, _.isEqual).length;
}

export function diversityPointsDescription() {
  const options = diversityPointsOptions();
  if (options.raceEthnicity) return 'Unique intersectional identities within the classroom, based on race and ethnicity.';
  if (options.raceEthnicityGender) return 'Unique intersectional identities within the classroom, based on race, ethnicity and gender.';
  if (options.maximal) return 'Unique intersectional identities within the classroom, based on race, ethnicity, gender, home language, specific disability, reduced lunch status, and limited or FLEP status.';

  return 'Unique intersectional identities within the classroom, based on race.';
}

function diversityPointsOptions() {
  const queryParams = qs.parse(window.location.search.slice(1));
  return {
    raceEthnicity: _.has(queryParams, 'race_ethnicity'),
    raceEthnicityGender: _.has(queryParams, 'race_ethnicity_gender'),
    maximal: _.has(queryParams, 'maximal')
  };
}

export function intersectionsFor(student) {
  const options = diversityPointsOptions();
  if (options.raceEthnicity) return [
    student.race,
    student.hispanic_latino
  ];

  if (options.raceEthnicityGender) return [
    student.race,
    student.hispanic_latino,
    student.gender
  ];

  if (options.maximal) return [
    student.race,
    student.hispanic_latino,
    student.gender,
    student.disability,
    isLimitedOrFlep(student),
    isLowIncome(student),
    student.home_language
  ];

  return [student.race];
}

export const HighlightKeys = {
  IEP_OR_504: 'IEP_OR_504',
  LIMITED_OR_FLEP: 'LIMITED_OR_FLEP',
  GENDER: 'GENDER',
  LOW_INCOME: 'LOW_INCOME',
  HIGH_DISCIPLINE: 'HIGH_DISCIPLINE',
  STAR_MATH: 'STAR_MATH',
  STAR_READING: 'STAR_READING',
  DIBELS: 'DIBELS',
  DIVERSITY_POINTS: 'DIVERSITY_POINTS'
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
