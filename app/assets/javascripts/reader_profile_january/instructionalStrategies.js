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

    instructionalStrategies = records.map(row => {
      return {
        ...row,
        grades: row.grades.split(' ').map(g => g === 'K' ? 'KF' : g)
      };
    });
  }

  return instructionalStrategies;
}