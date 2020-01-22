import _ from 'lodash';

// Keys for describing the reading categories.
export const STUDENT_EXPERIENCE = 'c:STUDENT_EXPERIENCE';
export const ORAL_LANGUAGE = 'c:ORAL_LANGUAGE';
export const PHONOLOGICAL_AWARENESS = 'c:PHONOLOGICAL_AWARENESS';
export const PHONICS_FLUENCY = 'c:PHONICS_FLUENCY';
export const COMPREHENSION = 'c:COMPREHENSION';


// Map the downcased text that people use in Excel to internal keys,
// so code outside this file can only use keys.
const CategoryKeyMapping = {
  'phonological awareness': PHONOLOGICAL_AWARENESS,
  'phonics fluency': PHONICS_FLUENCY
};

// Takes the CSV format, but parses the grades field into an array
// that uses Student Insights-style grade values (eg, KF for kindergarten).
let instructionalStrategies = null;
export function readInstructionalStrategies() {
  if (instructionalStrategies === null) {
    instructionalStrategies = _.flatMap(RAW_RECORDS, row => {
      const categoryKey = CategoryKeyMapping[row.category_text.toLowerCase()];
      if (!categoryKey) return [];
      return [{
        ...row,
        category_key: categoryKey,
        grades: row.grades.split(' ').map(g => g === 'K' ? 'KF' : g)
      }];
    });
  }

  return instructionalStrategies;
}

// Instructional strategies are by category and grade, generically.
// Also filter ones that don't have text or educator_email.
export function matchStrategies(strategies, grade, categoryKey) {
  return strategies.filter(strategy => {
    if (strategy.grades.indexOf(grade) === -1) return false;
    if (strategy.category_key !== categoryKey) return false;
    if (strategy.text === '') return false;
    if (strategy.educator_email === '') return false;

    return true;
  });
}


/*
const fs = require('fs');
const csv = fs.readFileSync('strategies.csv').toString();
const parse = require('csv-parse/lib/sync');
const records = parse(csv, {
  columns: true,
  skip_empty_lines: true
});
console.log(JSON.stringify(records.slice(2), null, 2));
*/
const RAW_RECORDS = [
  {
    "category_text": "Phonological Awareness",
    "grades": "K 1 2 3 4 5",
    "text": "SPS Heggerty",
    "description": "5 minute lessons for phonological awareness",
    "educator_email": "ggeorge",
    "url": "https://www.dropbox.com/sh/md15rd36xq81wwi/AAD-I9Eto1rG5wdgwN3bxOEwa/ELA%202019-2020/Kindergarten/PA%20Intervention"
  },
  {
    "category_text": "Phonological Awareness",
    "grades": "K",
    "text": "SPS notebook for double dose",
    "description": "Notebook for repeating Kindergarten PA unit, 12 weeks",
    "educator_email": "jbuckwalter",
    "url": "https://www.dropbox.com/sh/md15rd36xq81wwi/AAD40J3eTcxj5khUtz5mpRKva/ELA%202019-2020/Kindergarten/PA%20Workbooks"
  },
  {
    "category_text": "Phonological Awareness",
    "grades": "1 2 3",
    "text": "LIPS",
    "description": "Intensive 3x/week program focused on sound production",
    "educator_email": "uharel",
    "url": "https://lindamoodbell.com/program/lindamood-phoneme-sequencing-program"
  },
  {
    "category_text": "Phonics Fluency",
    "grades": "K 1",
    "text": "SPS Lively Letters",
    "description": "Cards for practicing letter naming",
    "educator_email": "cconnolly",
    "url": "https://www.dropbox.com/preview/ela%20folder/Lively%20Letters%20SPS%20version/SPS%20Lively%20Letters.pdf?role=personal"
  },
  {
    "category_text": "Phonics Fluency",
    "grades": "K 1 2 3",
    "text": "CVC Blending notebook",
    "description": "Notebook for practicing CVC blends",
    "educator_email": "mjouvelakas",
    "url": "https://drive.google.com/drive/folders/1E9ZNh3gJzRWZwijF-VYI-In3M8dEAjJa"
  },
  {
    "category_text": "Phonics Fluency",
    "grades": "1 2 3",
    "text": "Snap Words",
    "description": "5min lessons with visual stories for learning sight words",
    "educator_email": "jbuckwalter",
    "url": "https://drive.google.com/open?id=1SjAypbcoTyUVQ6wCsKSYVGnEvlCSLicu"
  },
  {
    "category_text": "Phonics Fluency",
    "grades": "4 5",
    "text": "Rewards",
    "description": "25 lesson, multi-syllabic decoding fluency intervention",
    "educator_email": "uharel",
    "url": "https://www.voyagersopris.com/literacy/rewards/overview"
  },
  {
    "category_text": "Phonics Fluency",
    "grades": "2 3 4 5",
    "text": "Inside Phonics",
    "description": "For ELL students, daily systematic intervention",
    "educator_email": "pmitropoulos",
    "url": "https://ngl.cengage.com/search/productOverview.do?N=4294918395+201+4294918868&Ns=P_Product_Title%7C0&Ntk=P_EPI&Ntt=16168729182104448189494671682736665835&Ntx=mode%2Bmatchallpartial&homePage=false"
  },
  {
    "category_text": "Oral language",
    "grades": "2 3 4 5",
    "text": "Visualizing Verbalizing",
    "description": "Listening comprehension and oral language program",
    "educator_email": "uharel",
    "url": "https://lindamoodbell.com/program/visualizing-and-verbalizing-program"
  }
];
