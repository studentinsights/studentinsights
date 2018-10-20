import _ from 'lodash';
import moment from 'moment';
import {ORDERED_GRADES} from './gradeText';


export function baseSortByString(stringA, stringB) {
  if (!stringA && !stringB) return 0;

  if (!stringA) return -1;
  if (!stringB) return 1;

  if (stringA.toUpperCase() < stringB.toUpperCase()) return -1;
  if (stringA.toUpperCase() > stringB.toUpperCase()) return 1;

  return 0;
}

export function sortByString(a, b, sortBy) {
  const stringA = a[sortBy];
  const stringB = b[sortBy];

  return baseSortByString(stringA, stringB);
}

export function sortByNumber(a, b, sortBy) {
  // Parsing all numbers by floats to retain the decimal in sorting
  const numA = parseFloat(a[sortBy]);
  const numB = parseFloat(b[sortBy]);

  if(numA === numB) return 0;
  if(_.isNaN(numA)) return 1;
  if(_.isNaN(numB)) return -1;
  return numA > numB ? -1 : 1;
}

export function sortByCustomEnum(a, b, sortBy, customEnum) {
  const indexA = customEnum.indexOf(a[sortBy]);
  const indexB = customEnum.indexOf(b[sortBy]);

  if (indexA > indexB) return 1;
  if (indexB > indexA) return -1;
  return 0;
}

export function sortByDate(a, b, sortBy) {
  const dateA = moment(a[sortBy], 'MM/D/YY');
  const dateB = moment(b[sortBy], 'MM/D/YY');

  if (!dateA.isValid() && !dateB.isValid()) return 0;

  if (!dateB.isValid() || dateA.isAfter(dateB)) return -1;
  if (!dateA.isValid() || dateA.isBefore(dateB)) return 1;

  return 0;
}

export function sortByActiveServices(a, b) {
  const numA = a.active_services.length;
  const numB = b.active_services.length;

  if (numA > numB) return 1;
  if (numB > numA) return -1;
  return 0;
}


export function sortByGrade(gradeA, gradeB) {
  return ORDERED_GRADES[gradeA] - ORDERED_GRADES[gradeB];
}

export function rankedByGradeLevel(gradeLevel) {
  return ORDERED_GRADES[gradeLevel];
}
const ORDERED_SCHOOL_TYPES = {
  'ES': 200,
  'ESMS': 300,
  'MS': 400,
  'HS': 500,
  '': 600,
  [null]: 700,
  [undefined]: 800
};

export function rankedBySchoolType(schoolType) {
  return ORDERED_SCHOOL_TYPES[schoolType];
}

const ORDERED_LETTER_GRADES = {
  'A+': 100,
  'A': 120,
  'A-': 120,
  'B+': 130,
  'B': 150,
  'B-': 160,
  'C+': 170,
  'C': 180,
  'C-': 190,
  'D+': 200,
  'D': 210,
  'D-': 220,
  'F': 230
};

export function rankedByLetterGrade(letterGrade) {
  return hasLetterGrade(letterGrade) ? ORDERED_LETTER_GRADES[letterGrade] : 0;
}

export function hasLetterGrade(letterGrade) {
  return (ORDERED_LETTER_GRADES[letterGrade] !== undefined);
}