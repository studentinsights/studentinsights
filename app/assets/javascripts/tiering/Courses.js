import _ from 'lodash';

// eg see http://www.somerville.k12.ma.us/sites/default/files/SHS_2018-2019%20Program%20of%20Studies%20Final%20-%20Jan%2010%202018.pdf

function matches(text, patterns) {
  return _.some(patterns, pattern => text.indexOf(pattern) !== -1);
}

export function labelAssignment(assignment) {
  const text = assignment.section.course_description;
  if (matches(text, ELA)) return 'ela';
  if (matches(text, HISTORY)) return 'history';
  if (matches(text, MATH)) return 'math';
  if (matches(text, SCIENCE)) return 'science';
  if (matches(text, LANGUAGE)) return 'language';
  if (matches(text, HEALTH)) return 'health';

  if (matches(text, MUSIC)) return 'elective';
  if (matches(text, ART)) return 'elective';
  if (matches(text, ENGINEERING)) return 'elective';
  if (matches(text, BUSINESS)) return 'elective';
  
  if (matches(text, REDIRECT)) return 'support';
  if (matches(text, CREDIT_RECOVERY)) return 'support';
  if (matches(text, ACADEMIC_SUPPORT)) return 'support';
  if (matches(text, ADVISORY)) return 'support';
  if (matches(text, ENROOT)) return 'support';
  if (matches(text, OTHER_SUPPORT)) return 'support';
  if (matches(text, PATH_PROGRAM)) return 'support';

  if (matches(text, ELL)) return 'ell';
  if (matches(text, LIFE_SKILLS)) return 'life';

  if (matches(text, OTHER)) return 'elective';
  return 'unknown';
}

// This doesn't work exactly, since multiple sections may match
export function firstMatch(assignments, patterns) {
  return _.head(assignments.filter(assignment => {
    const text = assignment.section.course_description;
    return _.some(patterns, pattern => text.indexOf(pattern) !== -1);
  }));
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

const BUSINESS = [
  'ACCOUNTING',
  'ENTREPRENEURSHIP',
  'MARKETING',
  'PRACTICAL LAW',
  'FINANCE',
];


const OTHER = [
  'JOURNALISM',
  'TV/MEDIA PROD',
  'Extended Learning Program',
  'CHILD DEVELOPMENT',
  'INTERNSHIP',
  'VOC',
  'DENTAL',
  'CARPENTRY',
  'COSMETOLOGY',
  'COMPUTER PRIN/REP'
];

export const ELL = [
  'ALCS - GENERAL SUPPORT',
  'ESL',
  'GOAL PROGRAM DAILY SEMINAR',
  'ACADEMIC LITERACY'
];

export const ELA = [
  'ENGLISH',
  'READING FOUNDATIONS',
  'CREATIVE WRITING'
];

export const HISTORY = [
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

export const LANGUAGE = [
  'FRENCH',
  'PORTUGUESE',
  'SPANISH',
  'ITALIAN'
];

export const ENGINEERING = [
  'COMPUTER SCIENCE',
  'ELECTRICAL',
  'ENGINEERING',
  'MACHINE TECH',
  'AUTO TECHNOLOGY',
  'METAL FABRICATION',
  'COMPUTER ASST DRAFTING'
];

export const LIFE_SKILLS = [
  'ADAPTIVE LIFE SKILLS',
  'LIFE SKILLS PRE-WORK',
  'LIFE SKILLS SOCIAL SCIENCE',
  'LIFE SKILLS READING',
  'LIFE SKILLS - semester'
];


export const HEALTH = [
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


const ENROOT = [
  'ENROOT'
];

const PATH_PROGRAM = [
  'PATH PROGRAM ROSTER',
  'PATH PROGRAM SUPPORT'
];

const OTHER_SUPPORT = [
  'STUDENT MENTOR',
  'STUDY SKILLS',
  'TRANSITION SKILLS',
  'GRADUATION PLAN'
];