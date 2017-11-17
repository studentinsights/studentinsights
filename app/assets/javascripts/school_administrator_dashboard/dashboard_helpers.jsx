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
  }
};
