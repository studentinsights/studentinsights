import _ from 'lodash';

const gradeTextMap = {
  PK: 'Pre-K',
  KF: 'Kindergarten'
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