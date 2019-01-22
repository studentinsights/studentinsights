// benchmark_assessment_key values:
export function readDoc(doc, studentId, benchmarkAssessmentKey) {
  return (doc[studentId] || {})[benchmarkAssessmentKey] || '';
}

export const DIBELS_DORF_WPM = 'dibels_dorf_wpm';
export const DIBELS_DORF_ACC = 'dibels_dorf_acc';
export const F_AND_P_ENGLISH = 'f_and_p_english';
export const INSTRUCTIONAL_NEEDS = 'instructional_needs';



// all thresholds are "greater than or equal to" / "less than or equal to"
const somervilleDibelsThresholds = {
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