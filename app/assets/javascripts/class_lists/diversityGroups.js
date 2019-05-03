import _ from 'lodash';

// This is one way to frame diversity, chosen from talking with folks in Somerville
// about what they thought would be most important for teaching teams to consider
// as they're creating class lists.
//
const DiversityGroupKeys = {
  BLACK: 'BLACK',
  WHITE: 'WHITE',
  LATINX: 'LATINX',
  OTHER_IDENTITIES: 'OTHER_IDENTITIES'
};
export function diversityGroupKey(student) {
  if (!student.race) return DiversityGroupKeys.OTHER_IDENTITIES;
  const race = student.race.toLowerCase();

  // “black” see above
  if ((race.indexOf('black') !== -1) || (race.indexOf('african') !== -1)) {
    return DiversityGroupKeys.BLACK;
  }

  // “white” see above
  // edge cases here are from examining data
  if (((race === 'white') && student.hispanic_latino === false) || 
      ((race === 'caucasian or white') && student.hispanic_latino === false) || 
      ((race === 'white, white') && student.hispanic_latino === false) ||
      ((race === 'white, white, white') && student.hispanic_latino === false)) {
    return DiversityGroupKeys.WHITE;
  }

  // “latinx” see above
  if (student.hispanic_latino) return DiversityGroupKeys.LATINX;

  return DiversityGroupKeys.OTHER_IDENTITIES;
}

// For encoding one framing of racial and ethnic identity
export const DIVERSITY_GROUPS = [{
  key: DiversityGroupKeys.BLACK,
  text: '“black”',
  color: '#f4cae4',
  colorText: 'pink',
  description: 'Any identification as black or African-American, including mixed race.',
}, {
  key: DiversityGroupKeys.WHITE,
  text: '“white”',
  color: '#b3cde3',
  colorText: 'blue',
  description: 'Identification as only white or Caucasian, excluding mixed race, excluding Hispanic.',
}, {
  key: DiversityGroupKeys.LATINX,
  text: '“Latinx”',
  color: '#decbe4',
  colorText: 'purple',
  description: 'Identification as Hispanic but not “white” or black as above.',
}, {
  key: DiversityGroupKeys.OTHER_IDENTITIES,
  text: '“Other identities”',
  color: '#fed9a6',
  colorText: 'orange',
  description: 'Other identities (eg, Asian, Native, mixed race).'
}];


export function diversityColor(diversityGroupKey) {
  return _.find(DIVERSITY_GROUPS, {key: diversityGroupKey}).color;
}

export function itemsForDiversityBreakdown(studentsInRoom) {
  const counts = {
    [DiversityGroupKeys.BLACK]: 0,
    [DiversityGroupKeys.WHITE]: 0,
    [DiversityGroupKeys.LATINX]: 0,
    [DiversityGroupKeys.OTHER_IDENTITIES]: 0
  };
  studentsInRoom.forEach(student => {
    const key = diversityGroupKey(student);
    counts[key] = counts[key] + 1;
  });
  return [{
    color: diversityColor(DiversityGroupKeys.BLACK),
    key: DiversityGroupKeys.BLACK,
    left: 0,
    width: counts[DiversityGroupKeys.BLACK]
  }, {
    color: diversityColor(DiversityGroupKeys.WHITE),
    key: DiversityGroupKeys.WHITE,
    left: counts[DiversityGroupKeys.BLACK],
    width: counts[DiversityGroupKeys.WHITE]
  }, {
    color: diversityColor(DiversityGroupKeys.LATINX),
    key: DiversityGroupKeys.LATINX,
    left: (counts[DiversityGroupKeys.BLACK] + counts[DiversityGroupKeys.WHITE]),
    width: counts[DiversityGroupKeys.LATINX]
  }, {
    color: diversityColor(DiversityGroupKeys.OTHER_IDENTITIES),
    key: DiversityGroupKeys.OTHER_IDENTITIES,
    left: (counts[DiversityGroupKeys.BLACK] + counts[DiversityGroupKeys.WHITE] + counts[DiversityGroupKeys.LATINX]),
    width: counts[DiversityGroupKeys.OTHER_IDENTITIES]
  }];
}