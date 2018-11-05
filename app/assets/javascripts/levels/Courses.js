import _ from 'lodash';
import {rankedByLetterGrade, hasLetterGrade} from '../helpers/SortHelpers';

// eg see http://www.somerville.k12.ma.us/sites/default/files/SHS_2018-2019%20Program%20of%20Studies%20Final%20-%20Jan%2010%202018.pdf

// This doesn't work exactly, since multiple sections may match
// (eg, multiple course enrollments in math, and only one has a grade).
//
// So as a heuristic, match courses first, then look at those with grades,
// and then take the lowest grade (since the idea here is to help educators
// find where students would benefit from more supports).
export function firstMatchWithGrades(assignments, patterns) {
  const matchingAssignments = matchingAssignmentsByPattern(assignments, patterns);
  const matchingAssignmentsWithGrades = matchingAssignments.filter(assignment => {
    return hasLetterGrade(assignment.grade_letter);
  });
  const sortedMatchingAssignments = _.sortBy(matchingAssignmentsWithGrades, assignment => {
    return rankedByLetterGrade(assignment.grade_letter);
  });
  return _.last(sortedMatchingAssignments);
}

export function firstMatch(assignments, patterns) {
  return _.first(matchingAssignmentsByPattern(assignments, patterns));
}

function matchingAssignmentsByPattern(assignments, patterns) {
  return assignments.filter(assignment => {
    const text = assignment.section.course_description;
    return _.some(patterns, pattern => text.toUpperCase().match(pattern) !== null);
  });
}

export const REDIRECT = [
  'REDIRECT'
];


export const ADVISORY = [
  'Advisory'
];

export const ACADEMIC_SUPPORT = [
  'ACADEMIC SUPPORT'
];

export const CREDIT_RECOVERY = [
  'CREDIT RECOVERY'
];

export const STUDY_SKILLS = [
  'STUDY SKILLS'
];



const ENGLISH = [
  'ENGLISH',
  'READING FOUNDATIONS',
  'CREATIVE WRITING'
];

const CORE_ELL_IN_PLACE_OF_ENGLISH = [
  /^ESL$/ // full exact match only
];

// Depending on the persective, courses might be considered ELL or
// within another department (eg, "ESL - Semester SS" would be ESL if asking
// which department "owns" the course, or would be Social Studies if asking
// for a student's grade in a particular type of subject).
//
// core ELL classes are considered part of the English dept. in the levels UI
// others are considered part of another department
//
// See also Somerville doc:
// https://docs.google.com/document/d/1Tkqm178Oh6_-zCepZn-KMsMZ8xN9Lf10gYYHicko-60/edit#
export const ENGLISH_OR_CORE_ELL = CORE_ELL_IN_PLACE_OF_ENGLISH.concat(ENGLISH);

export const SOCIAL_STUDIES = [
  'HISTORY',
  'GOVT AND POLITICS AP',
  'AMERICAN IDENTITIES HONORS',
  'CURRENT EVENTS',
  'GOVT and POLITICS',
  'ESL - SEMESTER SS'
];

export const MATH = [
  'GEOMETRY',
  'ALGEBRA',
  'MATH',
  'PRECALCULUS',
  'STATISTICS',
  'CALCULUS',
  'DATA ANALYSIS'
];

export const SCIENCE = [
  'BIOLOGY',
  'PHYSICS',
  'CHEMISTRY',
  'PHYSIOLOGY',
  'HUMAN BEHAVIOR',
  'OCEANOGRAPHY',
  'PSYCHOLOGY',
  'ENVIRONMENTAL SCIENCE',
  'BIOTECHNOLOGY',
  'ASTRONOMY'
];

