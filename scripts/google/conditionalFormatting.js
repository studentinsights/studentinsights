// copy these bits from thresholds.js
const DIBELS_DORF_WPM = 'dibels_dorf_wpm';
const DIBELS_DORF_ACC = 'dibels_dorf_acc';
const DIBELS_DORF_ERRORS = 'dibels_dorf_errors';
const DIBELS_FSF = 'dibels_fsf';
const DIBELS_LNF = 'dibels_lnf';
const DIBELS_PSF = 'dibels_psf';
const DIBELS_NWF_CLS = 'dibels_nwf_cls';
const DIBELS_NWF_WWR = 'dibels_nwf_wwr';
const F_AND_P_ENGLISH = 'f_and_p_english';
const F_AND_P_SPANISH = 'f_and_p_spanish';


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
    },
    '2:spring': { // check these
      benchmark: 'J'
    },
    '3:winter': { // check these
      benchmark: 'O',
      risk: 'M'
    },
    '3:spring': { // check these
      benchmark: 'P'
    }
  },
  [F_AND_P_SPANISH]: { // should be same as english
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
    },
    '2:spring': { // check these
      benchmark: 'J'
    },
    '3:winter': { // check these
      benchmark: 'O',
      risk: 'M'
    },
    '3:spring': { // check these
      benchmark: 'P'
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
  [DIBELS_NWF_CLS]: {
    'KF:winter': {
      benchmark: 27,
      risk: 12
    },
    'KF:spring': {
      benchmark: 37,
      risk: 27
    },
    '1:fall': {
      benchmark: 33,
      risk: 19
    },
    '1:winter': {
      benchmark: 50,
      risk: 30
    },
    '2:fall': {
      benchmark: 62,
      risk: 45
    },
    '1:spring': {
      benchmark: 78,
      risk: 42
    },
  },
  [DIBELS_NWF_WWR]: {
    'K:spring': {
      benchmark: 4,
      risk: 0
    },
    '1:fall': {
      benchmark: 4,
      risk: 1
    },
    '1:winter': {
      benchmark: 12,
      risk: 5
    },
    '1:spring': {
      benchmark: 18,
      risk: 9
    },
    '2:fall': {
      benchmark: 18,
      risk: 9
    },
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
    '2:fall': {
      benchmark: 68,
      risk: 46
    },
    '2:winter': {
      benchmark: 84,
      risk: 67
    },
    '2:spring': {
      benchmark: 100,
      risk: 82
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
    '2:fall': {
      benchmark: 93,
      risk: 84
    },
    '2:winter': {
      benchmark: 95,
      risk: 91
    },
    '2:spring': {
      benchmark: 97,
      risk: 93
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




/* -------------------------------------------- */


// // google sheets colors
// const LOW = '#F4C7C3';
// const MID = '#FCE8B2';
// const HIGH = '#B7E1CD';


// map insights keys to sheets keys
const sheetsAssessmentKeys = {
  [DIBELS_DORF_ACC]: 'DORF ACC',
  [F_AND_P_ENGLISH]: 'F&P Level English',
  [F_AND_P_SPANISH]: 'F&P Level Spanish',
  [DIBELS_FSF]: 'FSF',
  [DIBELS_LNF]: 'LNF',
  [DIBELS_PSF]: 'PSF',
  [DIBELS_NWF_CLS]: 'NWF CLS',
  [DIBELS_NWF_WWR]: 'NWF WWR',
  [DIBELS_DORF_WPM]: 'DORF WPM',
  [DIBELS_DORF_ERRORS]: 'DORF Errors'
};


// Convert thresholds.js format to spec for sheets
// boolean conditional formatting.
function thresholdsToBooleanFormatting(rules) {
  if (rules.risk) {
    return [
      { color: LOW, lte: rules.risk },
      { color: MID, between: [rules.risk, rules.benchmark] },
      { color: HIGH, gte: rules.benchmark },
    ];
  }
  if (rules.risk) {
    return [
      { color: LOW, lte: rules.risk }
    ];
  }
  if (rules.benchmark) {
    return [
      { color: HIGH, gte: rules.benchmark }
    ];
  }
  return [];
}


// outputs:
// [{
//   columnKey: '1 / WINTER / DORF ACC',
//   booleanFormatting: [
//     { color: LOW, values: [36] },
//     { color: MID, values: [36,50] },
//     { color: HIGH, values: [50] }
//   ]
// }]
function main() {
  let allThresholds = [];
  let noRules = [];

  Object.keys(somervilleThresholds).forEach(insightsAssessmentKey => {
    const assessmentKeyInSheets = sheetsAssessmentKeys[insightsAssessmentKey];
    Object.keys(somervilleThresholds[insightsAssessmentKey]).forEach(pairKey => {
      const [grade, period] = pairKey.toUpperCase().split(':');
      const thresholds = somervilleThresholds[insightsAssessmentKey][pairKey];

      const columnKey = [
        (grade === 'KF' ? 'K' : grade), // K in sheets
        period,
        assessmentKeyInSheets
      ].join(' / ');
      allThresholds.push({
        columnKey,
        thresholds,
        insightsAssessmentKey,
        grade,
        period
      });
    });
  });
  console.log(JSON.stringify(noRules, null, 2));
  console.log("\n\n\n");
  console.log(JSON.stringify(allThresholds));
}
main();
