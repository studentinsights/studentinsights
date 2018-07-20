import _ from 'lodash';

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

export function allGrades() {
  return Object.keys(ORDERED_GRADES);
}