// Functions used by Administrator Dasbhoard for grouping students and calculating attendance.
import _ from 'lodash';
import moment from 'moment';
import {firstDayOfSchoolForMoment} from '../helpers/schoolYear';

export default {
  groupByHomeroom(studentRecords) {
    return _.groupBy(studentRecords, 'homeroom_label');
  },

  averageDailyAttendance(absenceEventsByDay, size) {
    let averageDailyAttendance = {};
    Object.keys(absenceEventsByDay).forEach((day) => {
      const rawAvg = (size - absenceEventsByDay[day].length)/size*100;
      averageDailyAttendance[day] = Math.round(rawAvg*10)/10;
    });
    return averageDailyAttendance;
  },

  //For absences and tardies, removes those events that have been excused
  filterExcusedEvents(eventsArray) {
    return eventsArray.filter((event) => {
      return !event.excused && !event.dismissed;
    });
  },

  //array of all student absence events that can be filtered based on absence flags
  absenceEvents(studentRecordsArray) {
    return  _.flattenDeep(studentRecordsArray.map((student) => {
      return student.absences;
    }));
  },

  tardyEventsByDay(studentRecordsArray) {
    const absenceEvents = _.flattenDeep(studentRecordsArray.map((student) => {
      return student.tardies;
    }));
    return this.eventsGroupedByDay(absenceEvents);
  },

  eventsGroupedByDay(events) {
    return _.groupBy(events, (event) => {
      return moment.utc(event.occurred_at).format("YYYY-MM-DD");
    });
  },

  schoolYearStart() {
    const today = moment.utc();
    const schoolYearStartMoment = firstDayOfSchoolForMoment(today);
    return schoolYearStartMoment.format('YYYY-MM-DD');
  },

  //slightly faster than Array.filter for getting a new date range
  filterDates(dates, start_date, end_date) {
    return dates.sort().slice(this.getFirstDateIndex(dates, start_date), this.getLastDateIndex(dates, end_date));
  },

  getFirstDateIndex(dates, start_date) {
    for (let i = 0, max = dates.length; i < max; i++) {
      if (moment.utc(dates[i]).isSameOrAfter(moment.utc(start_date))) return i;
    }
    return dates.length;
  },

  getLastDateIndex(dates, end_date) {
    const result = dates.length;
    if (moment.utc(dates[dates.length]).isSameOrBefore(end_date)) return result;
    for (let i = dates.length; i--;) {
      if (moment.utc(dates[i]).isSameOrBefore(end_date)) return i+1;
    }
  }
};
