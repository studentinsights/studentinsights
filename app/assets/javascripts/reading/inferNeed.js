import _ from 'lodash';


const FLUENCY = 'FLUENCY';
const PHONOLOGICAL = 'PHONOLOGICAL';
const PHONICS = 'PHONICS';
const COMPREHENSION = 'COMPREHENSION';
const UNKNOWN = '';

// using https://dibels.uoregon.edu/docs/DIBELSNextRecommendedBenchmarkGoals.pdf
export function inferNeed(rowData) {
  // comprehension
  // f and p, above benchmark
  const fAndP = latestFAndP(rowData);
  if (fAndP && fAndP.charCodeAt() >= 'N'.charCodeAt()) return {need: COMPREHENSION, why: 'f_and_p'};

  // // star, treating above 40th as benchmark
  // const star = latestStar(rowData);
  // if (star && star >= 40) return {need: COMPREHENSION, why: 'star'};

  // dorf accuracy or dorf fluency
  if (tryDibels(rowData.dibels, '3', 'fall', 'dibels_dorf_acc') < 96) return {need: PHONICS, why: 'dibels_dorf_acc', data: tryDibels(rowData.dibels, '3', 'fall', 'dibels_dorf_acc')};
  if (tryDibels(rowData.dibels, '3', 'fall', 'dibels_dorf_wpm') < 72) return {need: FLUENCY, why: 'dibels_dorf_wpm', data: tryDibels(rowData.dibels, '3', 'fall', 'dibels_dorf_wpm')};


  // // now start triaging
  // // phonological, using last benchmark (not watermark benchmark, which is higher)
  // if (tryDibels(rowData.dibels, '1', 'fall', 'dibels_fsf') < 52) return {need: PHONOLOGICAL, why: 'dibels_fsf'};
  // if (tryDibels(rowData.dibels, '1', 'fall', 'dibels_lnf') < 58) return {need: PHONOLOGICAL, why: 'dibels_lnf'};
  // if (tryDibels(rowData.dibels, '1', 'fall', 'dibels_psf') < 51) return {need: PHONOLOGICAL, why: 'dibels_psf'};

  // // phonics, using last benchmark (not watermark benchmark, which is higher)
  // if (tryDibels(rowData.dibels, '2', 'fall', 'dibels_dorf_cls') < 74) return {need: PHONICS, why: 'dibels_dorf_cls'};
  // if (tryDibels(rowData.dibels, '2', 'fall', 'dibels_dorf_wwr') < 22) return {need: PHONICS, why: 'dibels_dorf_wwr'};

  // // fluency
  // if (tryDibels(rowData.dibels, '3', 'fall', 'dibels_dorf_acc') < 96) return {need: FLUENCY, why: 'dibels_dorf_acc'};
  // if (tryDibels(rowData.dibels, '3', 'fall', 'dibels_dorf_wpm') < 72) return {need: FLUENCY, why: 'dibels_dorf_wpm'};

  return {need: COMPREHENSION, why: 'fallthrough'};
  // sst, attendance, discipline?
  // not yet

  // default to comprehension anyway

  // vocabulary is omitted here (lumping into comprehension)
  


  // if (window.location.search.indexOf('instruction') === -1) {
  //   return [null, null];
  // }
  // return rowData.instructional_focus.split(': ');
}




// relies on already sorted
function tryLatest(key, list) {
  const obj = _.first(list);
  return obj ? obj[key] : null;
}


function latestFAndP(student) {
  return tryLatest('instructional_level', student.f_and_p_assessments);
}

function tryDibels(dibels, grade, assessmentPeriod, assessmentKey) {
  const d = _.find(dibels, {
    grade,
    assessment_period: assessmentPeriod,
    assessment_key: assessmentKey,
  });

  return d ? d.data_point : null;
}



function latestStar(student) {
  return tryLatest('percentile_rank', student.star_reading_results);
}
