import _ from 'lodash';
import moment from 'moment';

class QuadConverter {
  // A quad is a 4-element array of numbers that represents numerical data on a given date.
  // The first three elements are (year, month, date) and the last is the value.
  // Months are 1-indexed (the way humans write months) and not 0-indexed like Date.getMonth.

  // These functions are provided for getting data out of quads.
  static toMoment(quad) {
    return moment.utc([quad[0], quad[1], quad[2]].join('-'), 'YYYY-M-D');
  }

  static toDate(quad) {
    return QuadConverter.toMoment(quad).toDate();
  }

  static toValue(quad) {
    return quad[3];
  }

  static toPair(quad){
    return [QuadConverter.toMoment(quad).valueOf(), QuadConverter.toValue(quad)];
  }

  // The "Star Object" adds an additional data point (4-indexed) to a quad.
  // This allows the rendering of gradeLevelEquivalent data in highcharts tooltip
  static toStarObject(quad){
    return {
      x: QuadConverter.toMoment(quad).valueOf(),
      y: QuadConverter.toValue(quad),
      gradeLevelEquivalent: QuadConverter.toGradeLevelEquivalent(quad)
    };
  }

  static toGradeLevelEquivalent(quad){
    return quad[4];
  }

  // These functions are provided for constructing quads.
  static fromMoment(momentObj, value){
    const year = momentObj.year();
    const month = momentObj.month() + 1;
    const date = momentObj.date();
    return [year, month, date, value];
  }

  static schoolYearStartDates(dateRange){
    // dateRange: A 2-element array of Moment objects.
    // returns: An array of Moment objects representing the start dates of each school year in the calendar year range.
    return QuadConverter._allSchoolYearStarts(dateRange)
          .map(QuadConverter.firstDayOfSchool);
  }

  static firstDayOfSchool(year){
    // year: An integer year.
    // returns: A moment object representing the first day of the school year that year starts.
    return QuadConverter.toMoment([year, 8, 15]);
  }

  static lastDayOfSchool(year){
    // year: An integer year.
    // returns: A moment object representing roughly the last day of that school year (which will
    // be in the following calendar year).
    return QuadConverter.toMoment([year + 1, 6, 30]);
  }

  static toSchoolYear(date) {
    // date: A JS date object or Moment object.
    // returns: Integer representing what the calendar year was in the fall of date's school year.
    const momentObject = moment.utc(date);

    const year = momentObject.year();
    const startOfSchoolYear = QuadConverter.toMoment([year, 8, 15]);
    const isEventDuringFall = momentObject.diff(startOfSchoolYear, 'days') > 0;
    return (isEventDuringFall) ? year : year - 1;
  }

  // Takes an array of attendanceEvent objects.
  // Returns an array of quads, each representing the first of the month, with a value equal to the number of
  // events that happened in that month.
  static cumulativeByMonthFromEvents(attendanceEvents) {
    const groupedByMonth = _.groupBy(attendanceEvents, function(event){
      return moment.utc(event.occurred_at).startOf('month').toISOString();
    });

    // result is an array of quads, one quad per month.
    let result = [];

    _.each(groupedByMonth, function(value, key){
      result.push(QuadConverter.fromMoment(moment.utc(key), value.length));
    });

    // sort chronologically.
    return _.sortBy(result, QuadConverter.toMoment.bind(this));
  }

  static _allSchoolYearStarts(dateRange) {
    // dateRange: A 2-element array of Moment objects.
    // returns: An array of integers, each school year in the range.
    const schoolYearStarts = _.map(dateRange, QuadConverter.toSchoolYear);
    return _.range(schoolYearStarts[0], schoolYearStarts[1] + 1);
  }

}

export default QuadConverter;
