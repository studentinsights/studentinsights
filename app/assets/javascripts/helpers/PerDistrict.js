import * as Filters from './Filters';


const ORDERED_DISABILITY_VALUES_MAP = {
  'new_bedford': [
    "Does Not Apply",
    "Low-Less Than 2hrs/week",
    "Low-2+ hrs/week",
    "Moderate",
    "High"
  ],
  'somerville': [
    // also include null
    'Low < 2',
    'Low >= 2',
    'Moderate',
    'High'
  ]
};

export function orderedDisabilityValues(districtKey) {
  return ORDERED_DISABILITY_VALUES_MAP[districtKey] || [];
}

// Includes if they "exited" the 504
export function hasInfoAbout504Plan(maybeStudent504Field) {
  if (maybeStudent504Field === undefined) return false;
  if (maybeStudent504Field === null) return false;
  if (maybeStudent504Field === '') return false;
  if (maybeStudent504Field === '504') return true; // Somerville
  if (maybeStudent504Field === 'Not 504') return false; // Somerville
  if (maybeStudent504Field === 'NotIn504') return false; // Somerville & New Bedford
  if (maybeStudent504Field === 'Exited') return true; // New Bedford
  if (maybeStudent504Field === 'Active') return true; // New Bedford

  return true;
}

// Renders a table for `SlicePanels` that works differently for different
// districts.
export function renderSlicePanelsDisabilityTable(districtKey, options = {}) {
  const {createItemFn, renderTableFn} = options;

  const key = 'sped_level_of_need';
  const itemsFromValues = orderedDisabilityValues(districtKey).map(value => {
    return createItemFn(value, Filters.Equal(key, value));
  });

  // Somerville uses a null value for no disability, while New Bedford
  // uses a separate value to describe that explicitly.
  const items = (districtKey === 'somerville')
    ? [createItemFn('None', Filters.Null(key))].concat(itemsFromValues)
    : itemsFromValues;
  return renderTableFn({items, title: 'Disability'});
}

// Check educator labels to see if the educator belongs to
// the NGE and 10GE experience teams.  This label only applies to
// Somerville.
export function inExperienceTeam(educatorLabels) {
  return (educatorLabels.indexOf('shs_experience_team') !== -1);
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
  if (districtKey === 'somerville') {
    return ORDERED_SOMERVILLE_SCHOOL_SLUGS_BY_GRADE[slugA] - ORDERED_SOMERVILLE_SCHOOL_SLUGS_BY_GRADE[slugB];
  }

  return slugA.localeCompare(slugB);
}

// This only applies to Somerville HS.
export function shouldDisplayHouse(school) {
  return (school && school.local_id === 'SHS');
}

// This only applies to high schools.
export function shouldDisplayCounselor(school) {
  return (school && school.school_type === 'HS');
}
