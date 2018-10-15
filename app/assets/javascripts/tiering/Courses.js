import _ from 'lodash';
import {rankedByLetterGrade, hasLetterGrade} from '../helpers/SortHelpers';

// eg see http://www.somerville.k12.ma.us/sites/default/files/SHS_2018-2019%20Program%20of%20Studies%20Final%20-%20Jan%2010%202018.pdf

// This doesn't work exactly, since multiple sections may match
// (eg, multiple course enrollments in math, and only one has a grade).
//
// So as a heuristic, match courses first, then look at those with grades,
// and then take the lowest grade (since the idea here is to help educators
// find where students would benefit from more supports).
export function firstMatch(assignments, patterns) {
  const matchingAssignments = assignments.filter(assignment => {
    const text = assignment.section.course_description;
    return _.some(patterns, pattern => text.indexOf(pattern) !== -1);
  });
  const matchingAssignmentsWithGrades = matchingAssignments.filter(assignment => {
    return hasLetterGrade(assignment.grade_letter);
  });
  const sortedMatchingAssignments = _.sortBy(matchingAssignmentsWithGrades, assignment => {
    return rankedByLetterGrade(assignment.grade_letter);
  });
  return _.last(sortedMatchingAssignments);
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
  'ESL'
];

const ELL = CORE_ELL_IN_PLACE_OF_ENGLISH.concat([
  'ALCS - GENERAL SUPPORT',
  'GOAL PROGRAM DAILY SEMINAR',
  'ACADEMIC LITERACY'
]);

 // core ELL classes are considered part of the English dept. in the levels UI
export const ENGLISH_OR_CORE_ELL = CORE_ELL_IN_PLACE_OF_ENGLISH.concat(ENGLISH);

export const SOCIAL_STUDIES = [
  'HISTORY',
  'GOVT and POLITICS AP',
  'AMERICAN IDENTITIES HONORS',
  'CURRENT EVENTS',
  'GOVT and POLITICS'
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
  'ENVIRONMENTAL SCIENCE AP',
  'ENVIRONMENTAL SCIENCE',
  'BIOTECHNOLOGY',
  'ASTRONOMY'
];


const BUSINESS = [
  'ACCOUNTING',
  'ENTREPRENEURSHIP',
  'MARKETING',
  'PRACTICAL LAW',
  'FINANCE',
];

const WORLD_LANGUAGES = [
  'FRENCH',
  'PORTUGUESE',
  'SPANISH',
  'ITALIAN'
];

const HEALTH = [
  'HEALTH',
  'FITNESS EDUCATION',
  'TEAM ACTIVITIES PE',
  'DANCE',
  'WEIGHT TRAINING',
  'COMPETITIVE ACTIVITIES PE',
  'SPORTS MEDICINE',
  'FOUNDATION PHYS ED',
  'NON-COMPET PE'
];

const MUSIC = [
  'PIANO',
  'BAND',
  'TEAM ACTIVITIES PE',
  'CHORUS',
  'ORCHESTRA',
  'MUSIC',
  'GUITAR',
  'DRUM LINE',
  'PERCUSSION'
];

const ART = [
  'ART',
  'CERAMICS',
  'PHOTOGRAPHY',
  'FILM',
  'GRAPHIC COMM',
  'CALLIGRAPHY',
  'DRAMA WORKSHOP',
  'ARCHITECTURAL DRAWING'
];

const CTE = [];
const LIBRARY = [];
const PHYSICAL_EDUCATION = [];

// const ENROOT = [
//   'ENROOT'
// ];

// const PATH_PROGRAM = [
//   'PATH PROGRAM ROSTER',
//   'PATH PROGRAM SUPPORT'
// ];

// const OTHER_SUPPORT = [
//   'STUDENT MENTOR',
//   'TRANSITION SKILLS',
//   'GRADUATION PLAN'
// ];

// const ENGINEERING = [
//   'COMPUTER SCIENCE',
//   'ELECTRICAL',
//   'ENGINEERING',
//   'MACHINE TECH',
//   'AUTO TECHNOLOGY',
//   'METAL FABRICATION',
//   'COMPUTER ASST DRAFTING'
// ];

// const LIFE_SKILLS = [
//   'ADAPTIVE LIFE SKILLS',
//   'LIFE SKILLS PRE-WORK',
//   'LIFE SKILLS SOCIAL SCIENCE',
//   'LIFE SKILLS READING',
//   'LIFE SKILLS - semester'
// ];

// const OTHER = [
//   'JOURNALISM',
//   'TV/MEDIA PROD',
//   'Extended Learning Program',
//   'CHILD DEVELOPMENT',
//   'INTERNSHIP',
//   'VOC',
//   'DENTAL',
//   'CARPENTRY',
//   'COSMETOLOGY',
//   'COMPUTER PRIN/REP'
// ];

const SPECIAL_PROGRAMS = []
  .concat(REDIRECT)
  .concat(ADVISORY)
  .concat(ACADEMIC_SUPPORT)
  .concat(CREDIT_RECOVERY);

const SPECIAL_EDUCATION = []
  .concat(STUDY_SKILLS);

export function labelDepartmentKey(assignment) {
  const text = assignment.section.course_description;

  if (matches(text, ENGLISH)) return 'english';
  if (matches(text, MATH)) return 'math';
  if (matches(text, SCIENCE)) return 'science';
  if (matches(text, SOCIAL_STUDIES)) return 'social_studies';

  if (matches(text, ART)) return 'art';
  if (matches(text, BUSINESS)) return 'business';
  if (matches(text, CTE)) return 'cte';
  if (matches(text, ELL)) return 'ell';
  if (matches(text, HEALTH)) return 'health';
  if (matches(text, LIBRARY)) return 'library';  
  if (matches(text, MUSIC)) return 'music';
  if (matches(text, HEALTH)) return 'health';
  if (matches(text, PHYSICAL_EDUCATION)) return 'physical_education';
  if (matches(text, SPECIAL_EDUCATION)) return 'special_education';
  if (matches(text, WORLD_LANGUAGES)) return 'world_languages';
  if (matches(text, SPECIAL_PROGRAMS)) return 'special_programs';

  return 'unknown';
}

function matches(text, patterns) {
  return _.some(patterns, pattern => text.indexOf(pattern) !== -1);
}
