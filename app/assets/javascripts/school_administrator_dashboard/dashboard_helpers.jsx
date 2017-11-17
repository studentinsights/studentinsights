// Functions used by Administrator Dasbhoard for grouping students and calculating attendance.

import _ from 'lodash';

export default {

  absenceEventsByDay: function(studentRecordsArray) {
    const absenceEvents = _.flattenDeep(studentRecordsArray.map((student) => {
      return student.absences;
    }));
    return this.eventsGroupedByDay(absenceEvents);
  },

  averageDailyAttendance: function(absenceEventsByDay, size) {
    let averageDailyAttendance = {};
    Object.keys(absenceEventsByDay).forEach((day) => {
      const rawAvg = (size - absenceEventsByDay[day].length)/size*100;
      averageDailyAttendance[day] = Math.round(rawAvg*10)/10;
    });
    return averageDailyAttendance;
  },

  eventsGroupedByDay: function(events) {
    return _.groupBy(events, (event) => {
      return moment.utc(event.occurred_at).format("YYYY-MM-DD");
    });
  },

  //slightly faster than Array.filter for getting a new date range
  filterDates: function(dates, start_date, end_date) {
    return dates.sort().slice(this.getFirstDateIndex(dates, start_date), this.getLastDateIndex(dates, end_date));
  },

  getFirstDateIndex: function(dates, start_date) {
    for (let i = 0, max = dates.length; i < max; i++) {
      if (moment.utc(dates[i]).isSameOrAfter(start_date)) return i;
    }
    return dates.length;
  },

  getLastDateIndex: function(dates, end_date) {
    const result = dates.length;
    if (moment.utc(dates[dates.length]).isSameOrBefore(end_date)) return result;
    for (let i = dates.length; i--;) {
      if (moment.utc(dates[i]).isSameOrBefore(end_date)) return i+1;
    }
  }
};
