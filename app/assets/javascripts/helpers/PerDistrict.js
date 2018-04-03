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

// Renders a table for `SlicePanels` that works differently for different
// districts.
export function renderSlicePanelsDisabilityTable(districtKey, options = {}) {
  const {createItemFn, renderTableFn} = options;

  const key = 'sped_level_of_need';
  const itemsFromValues = orderedDisabilityValues(districtKey).map(value => {
    return createItemFn(value, Filters.Equal(key, value));
  }, this);

  // Somerville uses a null value for no disability, while New Bedford
  // uses a separate value to describe that explicitly.
  const items = (districtKey === 'somerville')
    ? [createItemFn('None', Filters.Null(key))].concat(itemsFromValues)
    : itemsFromValues;
  return renderTableFn({items, title: 'Disability'});
}

// Check educator labels to see if the educator belongs to
// the NGE and 10GE experience teams.
export function inExperienceTeam(educatorLabels) {
  return (educatorLabels.indexOf('shs_experience_team') !== -1);
}