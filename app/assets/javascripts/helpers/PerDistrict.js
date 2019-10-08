import * as Filters from './Filters';
import _ from 'lodash';


export const SOMERVILLE = 'somerville';
export const NEW_BEDFORD = 'new_bedford';
export const BEDFORD = 'bedford';
export const DEMO = 'demo';

export function hasStudentPhotos(districtKey) {
  if (districtKey === SOMERVILLE) return true;
  if (districtKey === BEDFORD) return true;
  if (districtKey === NEW_BEDFORD) return true;
  return false;
}


// See also specialEducation.js
const ORDERED_DISABILITY_VALUES_MAP = {
  [NEW_BEDFORD]: [
    "Does Not Apply",
    "Low-Less Than 2hrs/week",
    "Low-2+ hrs/week",
    "Moderate",
    "High"
  ],
  [SOMERVILLE]: [
    // also include null
    'Low < 2',
    'Low >= 2',
    'Moderate',
    'High'
  ],
  [BEDFORD]: [    
    'Does Not Apply',
    'Low (2 hours or less)',
    'Low (2 or more hours)',
    'Moderate',
    'High'
  ]
};

export function shouldShowIepLink(districtKey) {
  if (districtKey === BEDFORD) return false;
  return true;
}

export function orderedDisabilityValues(districtKey) {
  return ORDERED_DISABILITY_VALUES_MAP[districtKey] || [];
}

// Should not include if they "exited" the 504 plan or if
// they had one previously.  For Somerville this is patched
// separately on the server as well, since this is determined
// by the presence of an active ed plan document, and the field
// on the student record in Aspen in inaccurate.
export function hasActive504Plan(maybeStudent504Field) {
  if (maybeStudent504Field === undefined) return false;
  if (maybeStudent504Field === null) return false;
  if (maybeStudent504Field === '') return false;
  if (maybeStudent504Field === '504') return true; // Somerville
  if (maybeStudent504Field === 'Not 504') return false; // Somerville
  if (maybeStudent504Field === 'NotIn504') return false; // Somerville & New Bedford
  if (maybeStudent504Field === 'Exited') return false; // New Bedford
  if (maybeStudent504Field === 'Active') return true; // New Bedford

  return false;
}



// Renders a table for `SlicePanels` that works differently for different
// districts.
export function renderSlicePanelsDisabilityTable(districtKey, options = {}) {
  const {createItemFn, renderTableFn} = options;

  const key = 'sped_level_of_need';
  const itemsFromValues = orderedDisabilityValues(districtKey).map(value => {
    return createItemFn(value, Filters.Equal(key, value));
  });

  // Somerville uses a null value for no disability instead of an explicit value.
  const items = (districtKey === SOMERVILLE)
    ? [createItemFn('None', Filters.Null(key))].concat(itemsFromValues)
    : itemsFromValues;
  return renderTableFn({items, title: 'SPED level'});
}

// Check educator labels to see if the educator should be shown 
// info about students in their courses with low grades.
export function shouldShowLowGradesBox(educatorLabels) {
  return (educatorLabels.indexOf('should_show_low_grades_box') !== -1);
}


const ORDERED_SOMERVILLE_SCHOOL_SLUGS_BY_GRADE = {
  'pic': 10,
  'cap': 100,
  'brn': 200,
  'hea': 300,
  'kdy': 300,
  'afas': 300,
  'escs': 300,
  'wsns': 300,
  'whcs': 300,
  'nw': 400,
  'shs': 500,
  'fc': 500,
  'sped': 600
};

export function sortSchoolSlugsByGrade(districtKey, slugA, slugB) {
  if (districtKey === SOMERVILLE) {
    return ORDERED_SOMERVILLE_SCHOOL_SLUGS_BY_GRADE[slugA] - ORDERED_SOMERVILLE_SCHOOL_SLUGS_BY_GRADE[slugB];
  }

  return slugA.localeCompare(slugB);
}

export function supportsHouse(districtKey) {
  if (districtKey === SOMERVILLE) return true;
  if (districtKey === BEDFORD) return true;
  if (districtKey === DEMO) return true;
  return false;
}

// This only applies to Somerville HS.
export function shouldDisplayHouse(school) {
  return (school && school.local_id === 'SHS');
}

export function somervilleHouses() {
  return [
    'Beacon',
    'Broadway',
    'Elm',
    'Highland'
  ];
}

export function supportsCounselor(districtKey) {
  if (districtKey === SOMERVILLE) return true;
  if (districtKey === DEMO) return true;
  if (districtKey === BEDFORD) return false; // data is exported, but not meaningful for K8
  return false;
}

// This only applies to high schools.
export function shouldDisplayCounselor(school) {
  return (school && school.school_type === 'HS');
}

export function supportsSpedLiaison(districtKey) {
  if (districtKey === SOMERVILLE) return true;
  if (districtKey === DEMO) return true;
  return false;
}

export function supportsExcusedAbsences(districtKey) {
  if (districtKey === NEW_BEDFORD) return false;
  
  if (districtKey === BEDFORD) return true;
  if (districtKey === SOMERVILLE) return true;
  if (districtKey === DEMO) return true;
  
  return false;
}

// In SHS high school, homeroom is a logical administrative assignment,
// but isn't meaningful to teachers or educators.  If there is
// a homeroom, it might not necessarily be worth showing.
export function isHomeroomMeaningful(districtKey, schoolLocalId) {
  if (districtKey === SOMERVILLE && schoolLocalId === 'SHS') return false;
  return true;
}

// What is the eventNoteTypeId to use in user-facing text about how to support
// students with high absences?
export function eventNoteTypeIdForAbsenceSupportMeeting(districtKey) {
  if (districtKey === BEDFORD) return 500; // stat
  if (districtKey === NEW_BEDFORD) return 400; // bbst
  if (districtKey === SOMERVILLE) return 300; // sst

  return 300;
}

// For searching notes, derived from choices for taking notes
export function eventNoteTypeIdsForSearch(districtKey) {
  const {leftEventNoteTypeIds, rightEventNoteTypeIds} = takeNotesChoices(districtKey);
  return _.uniq(leftEventNoteTypeIds.concat(rightEventNoteTypeIds));
}

// What choices do educators have for taking notes in the product?
export function takeNotesChoices(districtKey) {
  if (districtKey === SOMERVILLE || districtKey === DEMO) {
    return {
      leftEventNoteTypeIds: [300, 301, 302, 304],
      rightEventNoteTypeIds: [305, 306, 307, 308]
    };
  }

  if (districtKey === BEDFORD) {
    return {
      leftEventNoteTypeIds: [300, 302, 304],
      rightEventNoteTypeIds: []
    };
  }

  if (districtKey === NEW_BEDFORD) {
    return {
      leftEventNoteTypeIds: [400, 302, 304],
      rightEventNoteTypeIds: []
    };
  }

  throw new Error(`unsupported districtKey: ${districtKey}`);
}

// In tables of students, what eventNoteTypeIds should be shown as columns with notes
// about those students?
export function studentTableEventNoteTypeIds(districtKey, schoolType) {
  if (districtKey === BEDFORD) return [300, 302, 304];
  if (districtKey === NEW_BEDFORD) return [400];
  
  const isSomervilleOrDemo = (districtKey === SOMERVILLE || districtKey === DEMO);
  if (isSomervilleOrDemo && schoolType === 'HS') return [300, 305, 306, 307, 308];
  // Includes elementary/middle, Capuano early childhood, and SPED.
  if (isSomervilleOrDemo) return [300, 301];

  throw new Error(`unsupported districtKey: ${districtKey}`);
}


// What choices do educators have for recording services in the product?
// Order matters.
export function recordServiceChoices(districtKey) {
  if (districtKey === BEDFORD) {
    return [703, 707, 701, 702, 706, 708, 705, 704, 709];
  }

  if ([SOMERVILLE, DEMO, NEW_BEDFORD].indexOf(districtKey) !== -1) {
    return [503, 505, 502, 506, 504, 507];
  }

  throw new Error(`unsupported districtKey: ${districtKey}`);
}


// What service types should be in included in phaseslines for non-academic
// information (eg, attendance, behavior, social or emotional?)
export function nonAcademicServiceTypeIdsForPhaselines(districtKey) {
  if (districtKey === BEDFORD) {
    return [702, 703, 704, 705, 709];
  }
  if ([SOMERVILLE, DEMO, NEW_BEDFORD].indexOf(districtKey) !== -1) {
    return [502, 503, 504, 505, 506];
  }
  throw new Error(`unsupported districtKey: ${districtKey}`);
}


// See PerDistrict.rb#does_students_export_include_rows_for_inactive_students?
export function isStudentActive(districtKey, student) {
  if (districtKey === BEDFORD) return !student.missing_from_last_export;
  if (districtKey === NEW_BEDFORD) return !student.missing_from_last_export;
  if (districtKey === SOMERVILLE) return student.enrollment_status === 'Active';

  // Check both as fallback
  return student.enrollment_status === 'Active' && !student.missing_from_last_export;
}


// Should STAR be used on student profiles at all?
export function shouldUseStarData(districtKey) {
  if (districtKey === SOMERVILLE) return true;
  if (districtKey === DEMO) return true;
  if (districtKey === NEW_BEDFORD) return true;
  if (districtKey === BEDFORD) return false; // no STAR data

  return false;
}

// Can student photos be zoomed in on student faces in smaller
// contexts?
export function enhancedStudentPhotoStyles(districtKey) {
  if (districtKey === SOMERVILLE) {
    return {
      backgroundSize: '150%',
      backgroundPositionY: -10
    };
  }

  if (districtKey === BEDFORD || districtKey === DEMO) {
    return {
      backgroundSize: '130%',
      backgroundPositionY: -5
    };
  }
  
  if (districtKey === NEW_BEDFORD) {
    return {
      backgroundSize: '110%',
      backgroundPositionY: -10
    };
  }

  return {
    backgroundSize: '100%'
  };
}

// For shorter names and prettier UI, returns string or throws if unsupported
export function shortSchoolName(districtKey, schoolLocalId) {
  if (districtKey === SOMERVILLE) {
    return tryShortSchoolName(districtKey, schoolLocalId) || 'Unknown school';
  }

  throw new Error(`unsupported districtKey: ${districtKey}`);
}

// For shorter names and prettier UI, may be null if not supported
// by district or not found.
export function tryShortSchoolName(districtKey, schoolLocalId) {
  if (districtKey === SOMERVILLE) {
    return {
      BRN: 'Brown',
      HEA: 'Healey',
      KDY: 'Kennedy',
      AFAS: 'Argenziano',
      ESCS: 'East',
      WSNS: 'West',
      WHCS: 'Winter Hill',
      NW: 'Next Wave',
      SHS: 'Somerville High',
      FC: 'Full Circle',
      CAP: 'Capuano',
      PIC: 'Parent PIC',
      SPED: 'Special Education'
    }[schoolLocalId] || null;
  }

  return null;
}

// Decide which tabs to show in the student profile page.
export function decideStudentProfileTabs(districtKey, schoolType) {
  const isHighSchool = (schoolType === 'HS');
  if (([SOMERVILLE, DEMO].indexOf(districtKey) !== -1) && isHighSchool) return {grades: true, testing: true};
  return {reading: true, math: true};
}

// Only supported in Somerville (it's a separate data flow).
export function includeSectionGrade(districtKey) {
  if (districtKey === SOMERVILLE) return true;
  if (districtKey === DEMO) return true;
  if (districtKey === NEW_BEDFORD) return false;
  return false;
}