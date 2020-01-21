import _ from 'lodash';

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

let instructionalStrategies = null;


// Keys for describing the reading categories.
export const Categories = {
  PHONOLOGICAL_AWARENESS: 'c:PHONOLOGICAL_AWARENESS',
  PHONICS_FLUENCY: 'c:PHONOLOGICAL_AWARENESS'
};

// Map the downcased text that people use in Excel to internal keys,
// so code outside this file can only use keys.
const CategoryKeyMapping = {
  'phonological awareness': Categories.PHONOLOGICAL_AWARENESS,
  'phonics fluency': Categories.PHONICS_FLUENCY
};

// Takes the CSV format, but parses the grades field into an array
// that uses Student Insights-style grade values (eg, KF for kindergarten).
export function readInstructionalStrategies() {
  if (instructionalStrategies === null) {
    const records = [
      {
        "category_text": "Phonological Awareness",
        "grades": "K",
        "text": "SPS Heggerty",
        "description": "5 minute lessons for phonological awareness",
        "educator_email": "ggeorge",
        "url": ""
      },
      {
        "category_text": "Phonological Awareness",
        "grades": "K 1 2 3 4 5",
        "text": "SPS notebook for double dose",
        "description": "Notebook for repeating Kindergarten PA unit",
        "educator_email": "jbuckwalter",
        "url": ""
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
      }
    ];

    instructionalStrategies = _.flatMap(records, row => {
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
