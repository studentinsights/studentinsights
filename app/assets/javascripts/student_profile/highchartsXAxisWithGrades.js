import _ from 'lodash';
import moment from 'moment';
import {schoolYearStartDates} from './QuadConverter';


// This returns a highcharts xAxis going back four years, with dates and
// the progression of grades and start of each school year shown below.
//
// TODO(kr) this doesn't work for all grades, and it assumes the
// student moved up a grade each year (because we don't have that historical
// data).
export function xAxisWithGrades(studentGrade, nowMoment, options = {}) {
  const nMonthsBack = options.nMonthsBack || 48;
  return [
    datesAxis(nowMoment, nMonthsBack),
    gradesAxis(nowMoment, nMonthsBack, studentGrade)
  ];
}

// The intent of fixing this date range is that when staff are looking at profile of different students,
// the scales are consistent (and not changing between 3 mos and 6 years depending on the student's record,
// since that's easy to miss and misinterpret.
//
// Explicitly format dates, to opt out of highcharts inferring
// See https://stackoverflow.com/questions/43667961/highcharts-show-datetime-format-on-xaxis
function datesAxis(nowMoment, nMonthsBack) {
  const startMoment = nowMoment.clone().subtract(nMonthsBack, 'months');
  return {
    type: 'datetime',
    min: startMoment.toDate().getTime(),
    max: nowMoment.toDate().getTime(),
    labels: {
      formatter() {
        return moment.utc(this.value).format("MMM 'YY"); 
      }
    }
  };
}


// Show grades over time
export function gradesAxis(nowMoment, nMonthsBack, studentGrade, options = {}) {
  const gradeNumber = (studentGrade === parseInt(studentGrade, 10).toString())
    ? parseInt(studentGrade, 10)
    : 0;
  const categories = getSchoolYearStartPositions(nMonthsBack, nowMoment, gradeNumber, options);
  const tickPositions = _.keys(categories).map(Number);

  return {
    type: 'datetime',
    offset: 35,
    linkedTo: 0,
    tickPositions,
    categories
  };
}


export function getSchoolYearStartPositions(n, now, currentGradeNumber, options = {}) {
  // Takes in an integer (number of months back), the current date
  // as a Moment object (UTC), and the student's current grade.
  // Returns an object mapping:
  // integer (timestamp) --> string (school year starting at that position).

  const range = [now.clone().subtract(n, 'months'), now];
  const startDates = schoolYearStartDates(range);
  return _.zipObject(
    startDates.map(date => date.valueOf()),
    startDates.map((date, i) => {
      const gradeNumber = (currentGradeNumber - startDates.length) + (i + 1); // (current_grade - n/12) to current_grade inclusive
      return options.labelForGrade ? options.labelForGrade(gradeNumber) : labelForGrade(gradeNumber);
    })
  );
}


// Assumes that the student progressed grades each school year,
// which we should improve but would need other data sources
function labelForGrade(gradeNumber) {
  // No label for "negative" grades
  if (gradeNumber < 0) return '';

  // Kindergarten
  const gradeText = (gradeNumber === 0) ? 'KF' : gradeNumber;
  return `<b>Grade ${gradeText}<br>started</b>`;
}
