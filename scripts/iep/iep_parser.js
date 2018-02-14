const textract = require('textract');


function matchAll(string, pattern, fn) {
  const matches = [];
  var match; // eslint-disable-line no-var
  while ((match = pattern.exec(string)) != null) {
    matches.push(fn(match));
  }
  return matches;
}

// It's hard to split on the service/personnel.  The approach here is to whitelist the endings to the services.
// Alternately, we could whitelist on the personnel.  A starting point list for that is:
// (Occupational Therapist|Speech/Language Pathologist|Teacher of the Visually Impaired|Teacher of Visually Impaired|Nurses|Physical Therapist)
//
// It's also hard to split on the frequency and cycle, so we just grab from the number to the dates.
function parseServiceGrid(section) {
  
  return matchAll(section, /\s*([\d,\s]*)\s+(.+?\s(Consult|Service|Pull Out|Program|Occupational Therapy|Vision|Speech\/Language)) (.+?) (\d.+?) (\d{1,2}\/\d{1,2}\/\d{4}) (\d{1,2}\/\d{1,2}\/\d{4})/g, match => {
    return {
      service: match[2],
      personnel: match[4],
      frequency: match[5],
      startDate: match[6],
      endDate: match[7],
      goals: match[1].split(', ')
    };
  });
}

// Parse the text extracted from an IEP-at-a-glance PDF.
function parseIepText(text) {
  // basic info
  const name = /Student:\s(.+?)\sIEP/.exec(text)[1];
  const dates = /IEP Dates: (\d{1,2}\/\d{1,2}\/\d{4}) - (\d{1,2}\/\d{1,2}\/\d{4})/.exec(text);
  const startDate = dates[1];
  const endDate = dates[2];
  const caseManager = /Case Manager:\s(.+?)\sNOTE:/.exec(text)[1];

  // extras, redundant with other data sources
  const language = /Primary Language:\s(.+?)\sSchool/.exec(text)[1];
  const school = /School Name:\s(.+?)\sGrade/.exec(text)[1];
  const grade = /Grade:\s(.+?)\sPrimary/.exec(text)[1];
  const disability = /Primary Disability:\s(.+?)\sCase Manager:/.exec(text)[1];

  // concerns, strengths, evals
  const framingSection = /Concerns, Strengths, and Key Evaluation Results Summary(.+?)Goals/.exec(text)[1];
  const strengths = /Student Strengths\s(.+?)\sKey Evaluation Results Summary/.exec(framingSection)[1];
  const concerns = /Parent and\/or Student Concerns\s(.+?)\sStudent Strengths/.exec(framingSection)[1];
  const evals = /Key Evaluation Results Summary\s(.+?)\s*$/.exec(framingSection)[1];

  // TODO: accommodations and modifications
  
  // goals
  // TODO sections like goals can be missing altogether, which mucks up the parsing for
  // related sections that use that text as markers
  const goalsSection = /Goals (.+?) General Curriculum Area/.exec(text)[1];
  const goals = matchAll(goalsSection, /Goal# (\d+) Specific Focus: (.+?)\sGoal:\s(.+?)\sObjectives:\s(.+?)\s/g, match => {
    return {
      number: match[1],
      specificFocus: match[2],
      goal: match[3],
      objectivesText: match[4]
    };
  });
  
  // service grid
  const consultSection = /Grid A: Consultation(.+?)Focus on Goal # Type of Service Type of Personnel Frequency and Duration per Cycle Start Date End Date\s(.+?)\sGrid B/.exec(text)[2];
  const inclusionSection = /Grid B: Services in the General Ed Classroom(.+?)Focus on Goal # Type of Service Type of Personnel Frequency and Duration per Cycle Start Date End Date\s(.+?)\sGrid C/.exec(text)[2];
  const separateSection = /Grid C. Services outside the General Ed Classroom(.+?)Focus on Goal # Type of Service Type of Personnel Frequency and Duration per Cycle Start Date End Date(.+?)Somerville Public Schools/.exec(text)[2];

  // output
  return {
    name,
    startDate,
    endDate,
    caseManager,
    extras: {
      language,
      grade,
      disability,
      school
    },
    concerns,
    strengths,
    evals,
    goals,
    serviceGrid: {
      consult: parseServiceGrid(consultSection),
      inclusion: parseServiceGrid(inclusionSection),
      separate: parseServiceGrid(separateSection)
    }
  };
}


/* eslint-disable no-undef */
/* eslint-disable no-console */
function main() {
  const filename = process.argv[2]; 
  if (process.argv.length !== 3) {
    console.log('Usage: node iep_parser.js iep.pdf');
    process.exit(1);
  }

  textract.fromFileWithPath(filename, (err, text) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    const iep = parseIepText(text);
    console.log(JSON.stringify(iep, null, 2));
  });
}
main();
