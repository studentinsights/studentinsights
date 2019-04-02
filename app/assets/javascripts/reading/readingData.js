import {
  high,
  medium,
  low
} from '../helpers/colors';


// benchmark_assessment_key values:
export function readDoc(doc, studentId, benchmarkAssessmentKey) {
  return (doc[studentId] || {})[benchmarkAssessmentKey] || '';
}

export const DIBELS_FSF_WPM = 'dibels_fsf_wpm';
export const DIBELS_LNF_WPM = 'dibels_lnf_wpm';
export const DIBELS_PSF_WPM = 'dibels_psf_wpm';
export const DIBELS_NWF_CLS = 'dibels_nwf_cls';
export const DIBELS_DORF_WPM = 'dibels_dorf_wpm';
export const DIBELS_DORF_ACC = 'dibels_dorf_acc';
export const F_AND_P_ENGLISH = 'f_and_p_english';
export const INSTRUCTIONAL_NEEDS = 'instructional_needs';


export function prettyDibelsText(benchmarkAssessmentKey) {
  return {
    [DIBELS_FSF_WPM]: 'First Sound Fluency',
    [DIBELS_LNF_WPM]: 'Letter Naming Fluency',
    [DIBELS_PSF_WPM]: 'Phonemic Segmentation Fluency',
    [DIBELS_NWF_CLS]: 'Nonsense Word Fluency',
    [DIBELS_DORF_WPM]: 'Oral Reading Fluency',
    [DIBELS_DORF_ACC]: 'Oral Reading Accuracy'
  }[benchmarkAssessmentKey];
}

/*
"Because the scores used to calculate the DIBELS Composite Score vary by grade and time of year, it is important to note that the composite score generally cannot be used to directly measure growth over time or to compare results across grades or times of year. However, because the logic and procedures used to establish benchmark goals are consistent across grades and times of year, the percent of students at or above benchmark can be compared, even though the mean scores are not comparable."
*/

// numbers are highest "intensive/at-risk" value and lowest "core/benchmark" value
// ie, thresholds are "greater than or equal to" / "less than or equal to"
//
// these are sourced from jan's index card, which is different
// from some spreadsheets, or published cut points for dibels 6th
// for different variants, see https://docs.google.com/spreadsheets/d/1Z8t1wmaE2mX6kkNGw_ZtPr2ZDVfXkEaTmRbVUofEo08
const somervilleDibelsThresholds = {
  [DIBELS_FSF_WPM]: {
    'KF:fall': {
      risk: 7,
      benchmark: 18
    },
    'KF:winter': {
      risk: 31,
      benchmark: 44
    }
  },
  [DIBELS_LNF_WPM]: { // see "why doesn't LNF have benchmark goals?"
    'KF:fall': {
      risk: 10,
      benchmark: 22
    },
    'KF:winter': {
      risk: 19,
      benchmark: 42
    },
    'KF:spring': {
      risk: 38,
      benchmark: 52
    }
  },
  [DIBELS_PSF_WPM]: {
    'KF:winter': {
      risk: 11,
      benchmark: 27
    },
    'KF:spring': {
      risk: 30,
      benchmark: 45
    }
  },
  [DIBELS_NWF_CLS]: {
    'KF:winter': {
      risk: 12,
      benchmark: 27
    },
    'KF:spring': {
      risk: 27,
      benchmark: 37
    }
  },
  [DIBELS_DORF_WPM]: {
    '3:fall': {
      benchmark: 93,
      risk: 72
    },
    '3:winter': {
      benchmark: 108,
      risk: 88
    },
    '3:spring': {
      benchmark: 123,
      risk: 100
    }
  },
  [DIBELS_DORF_ACC]: {
    '3:fall': {
      benchmark: 96,
      risk: 91
    },
    '3:winter': {
      benchmark: 97,
      risk: 93
    },
    '3:spring': {
      benchmark: 98,
      risk: 95
    }
  }
};


export function somervilleDibelsThresholdsFor(benchmarkAssessmentKey, grade, benchmarkPeriodKey) {
  const thresholds = somervilleDibelsThresholds[benchmarkAssessmentKey];
  if (!thresholds) return null;
  const periodKey = [grade, benchmarkPeriodKey].join(':');
  return thresholds[periodKey] || null;
}

export function dibelsColor(value, thresholds) {
  if (value >= thresholds.benchmark) return high;
  if (value <= thresholds.risk) return low;
  return medium;
}