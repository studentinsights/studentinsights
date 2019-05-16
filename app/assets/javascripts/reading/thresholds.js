// benchmarkAssessmentKey values
export const DIBELS_DORF_WPM = 'dibels_dorf_wpm';
export const DIBELS_DORF_ACC = 'dibels_dorf_acc';
export const DIBELS_DORF_ERRORS = 'dibels_dorf_errors';
export const DIBELS_FSF = 'dibels_fsf';
export const DIBELS_LNF = 'dibels_lnf';
export const DIBELS_PSF = 'dibels_psf';
export const DIBELS_NWF_CLS = 'dibels_nwf_cls';
export const DIBELS_NWF_WWR = 'dibels_nwf_wwr';
export const F_AND_P_ENGLISH = 'f_and_p_english';
export const F_AND_P_SPANISH = 'f_and_p_spanish';
export const INSTRUCTIONAL_NEEDS = 'instructional_needs';


// all thresholds are "greater than or equal to" / "less than or equal to"
// see also "DIBELS cut points" sheet at https://docs.google.com/spreadsheets/d/1Z8t1wmaE2mX6kkNGw_ZtPr2ZDVfXkEaTmRbVUofEo08
const somervilleThresholds = {
  [F_AND_P_ENGLISH]: { // based on colors from mega sheet
    'KF:fall': {
      benchmark: 'A'
    },
    'KF:winter': {
      benchmark: 'C',
      risk: 'A'
    },
    '1:winter': {
      benchmark: 'G',
      risk: 'D'
    }
  },
  [DIBELS_FSF]: {
    'KF:fall': {
      benchmark: 18,
      risk: 7
    },
    'KF:winter': {
      benchmark: 44,
      risk: 31
    },
  },
  [DIBELS_LNF]: {
    'KF:fall': {
      benchmark: 22,
      risk: 10
    },
    'KF:winter': {
      benchmark: 42,
      risk: 19
    },
    'KF:spring': {
      benchmark: 52,
      risk: 38
    },
    '1:fall': {
      benchmark: 50,
      risk: 36
    }
  },
  [DIBELS_PSF]: {
    'KF:winter': {
      benchmark: 27,
      risk: 11
    },
    'KF:spring': {
      benchmark: 45,
      risk: 30
    },
    '1:fall': {
      benchmark: 45,
      risk: 30
    }
  },
  [DIBELS_DORF_WPM]: {
    '1:winter': {
      benchmark: 30,
      risk: 18
    },
    '1:spring': {
      benchmark: 63,
      risk: 36
    },
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
    '1:winter': {
      benchmark: 85,
      risk: 73
    },
    '1:spring': {
      benchmark: 92,
      risk: 84
    },
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


export function somervilleReadingThresholdsFor(benchmarkAssessmentKey, grade, benchmarkPeriodKey) {
  const thresholds = somervilleThresholds[benchmarkAssessmentKey];
  console.log('  somervilleReadingThresholdsFor', benchmarkAssessmentKey, grade, benchmarkPeriodKey, thresholds);
  if (!thresholds) return null;
  const periodKey = [grade, benchmarkPeriodKey].join(':');
  // console.log('    value for periodKey', periodKey, ' = ', thresholds[periodKey]);
  return thresholds[periodKey] || null;
}
