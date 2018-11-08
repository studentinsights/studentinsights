import _ from 'lodash';

const NEXT_GEN_MCAS_RANGES = {
  NM: [400, 450],
  PM: [450, 500],
  M: [500, 550],
  E: [550, 600]
};

const OLD_MCAS_RANGES = {
  W: [200, 220],
  NI: [220, 240],
  P: [240, 260],
  A: [260, 281]
};


export function shortLabelFromNextGenMcasScore(score) {
  return _.find(Object.keys(NEXT_GEN_MCAS_RANGES), code => {
    const [lower, upper] = NEXT_GEN_MCAS_RANGES[code];
    return (score >= lower && score < upper);
  });
}
  
export function shortLabelFromOldMcasScore(score) {
  return _.find(Object.keys(OLD_MCAS_RANGES), code => {
    const [lower, upper] = OLD_MCAS_RANGES[code];
    return (score >= lower && score < upper);
  });
}


export function nextGenMcasScoreRange(code) {
  return NEXT_GEN_MCAS_RANGES[code];
}

export function oldMcasScoreRange(code) {
  return OLD_MCAS_RANGES[code];
}