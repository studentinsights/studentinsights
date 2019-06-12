import _ from 'lodash';
import {toSchoolYear} from './schoolYear';


export const ORDERED_GRADES = {
  'TK': 100,
  'PPK': 120,
  'PK': 120,
  'KF': 130,
  '1': 150,
  '2': 160,
  '3': 170,
  '4': 180,
  '5': 190,
  '6': 200,
  '7': 210,
  '8': 220,
  '9': 230,
  '10': 240,
  '11': 250,
  '12': 260,
  '13': 270,
  'SP': 280
};

const gradeTextMap = {
  TK: 'Pre-K (TK)',
  PPK: 'Pre-K (PPK)',
  PK: 'Pre-K (PK)',
  KF: 'Kindergarten',
  13: 'Extended (13)',
  SP: 'Special (SP)',
};

const suffixMap = {
  1: 'st',
  2: 'nd',
  3: 'rd'
};
export function gradeText(grade) {
  const text = gradeTextMap[grade];
  if (text) return text;

  if (_.isNumber(parseInt(grade, 10))) {
    const suffix = suffixMap[grade] || 'th';
    return `${grade}${suffix} grade`;
  }

  return grade;
}

// ordered
export function allGrades() {
  return _.sortBy(Object.keys(ORDERED_GRADES), grade => ORDERED_GRADES[grade]);
}

export function nextGrade(grade) {
  const grades = allGrades();
  const index = grades.indexOf(grade);
  return (index >= grades.length) ? null : grades[index + 1];
}

export function previousGrade(grade) {
  const grades = allGrades();
  const index = grades.indexOf(grade);
  return (index <= 0) ? null : grades[index - 1];
}


// infer the grade level at a past schoolYear
export function adjustedGrade(schoolYearThen, gradeNow, nowMoment) {
  const nowSchoolYear = toSchoolYear(nowMoment);
  const assessmentSchoolYear = schoolYearThen;

  var inferredGrade = gradeNow; // eslint-disable-line no-var
  for (var i = nowSchoolYear; i > assessmentSchoolYear; i--) { // eslint-disable-line no-var
    inferredGrade = previousGrade(inferredGrade);
  }

  return inferredGrade;
}