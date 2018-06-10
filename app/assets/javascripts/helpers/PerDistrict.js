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
  ],
  'demo': [
    // also include null
    'Low < 2',
    'Low >= 2',
    'Moderate',
    'High'
  ],

};

export function orderedDisabilityValues(districtKey) {
  return ORDERED_DISABILITY_VALUES_MAP[districtKey] || [];
}

// The table for `SlicePanels` that works differently for different
// districts because the data is stored differently, and this returns
// [{value,filter}] describing which filters the UI should show.
export function slicePanelsDisabilityItems(districtKey) {
  const key = 'sped_level_of_need';
  const itemsFromValues = orderedDisabilityValues(districtKey).map(value => {
<<<<<<< Updated upstream
    return createItemFn(value, Filters.Equal(key, value));
  }, this);
=======
    const filter = Filters.Equal(key, value);
    return {value, filter};
  });
>>>>>>> Stashed changes

  // Somerville uses a null value for no disability, while New Bedford
  // uses a separate value to describe that explicitly.
  return ((districtKey === 'somerville') || (districtKey === 'demo'))
    ? [{value: 'None', filter: Filters.Null(key)}].concat(itemsFromValues)
    : itemsFromValues;
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