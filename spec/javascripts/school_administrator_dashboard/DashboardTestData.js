
//stubbed events for dashboard specs
export const testEvents = {
  oneMonthAgo: {
    occurred_at: moment().subtract(1, 'months').format("YYYY-MM-DD HH:mm:sss Z"),
    student_id: 1,
  },
  twoMonthsAgo: {
    occurred_at: moment().subtract(2, 'months').format("YYYY-MM-DD HH:mm:sss Z"),
    student_id: 1,
  },
  threeMonthsAgo: {
    occurred_at: moment().subtract(3, 'months').format("YYYY-MM-DD HH:mm:sss Z"),
    student_id: 1,
  },
  fourMonthsAgo: {
    occurred_at: moment().subtract(4, 'months').format("YYYY-MM-DD HH:mm:sss Z"),
    student_id: 1,
  },
  oneYearAgo: {
    occurred_at: moment().subtract(1, 'year').format("YYYY-MM-DD HH:mm:sss Z"),
    student_id: 1,
  },
  thisMonth: {
    occurred_at: moment().format("YYYY-MM-DD HH:mm:sss Z"),
    student_id: 1
  }
};


//stubbed students for dashboard specs

export const Students = [
  {
    first_name: 'Pierrot',
    last_name: 'Zanni',
    homeroom: 'Test 1',
    id: 1,
    absences: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo, testEvents.threeMonthsAgo],
    tardies: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo, testEvents.threeMonthsAgo],
    events: 3,
    last_sst_date_text: moment.utc(testEvents.threeMonthsAgo.occurred_at).format('M/D/YY')
  },
  {
    first_name: 'Pierrette',
    last_name: 'Zanni',
    homeroom: 'Test 1',
    id: 2,
    absences: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo],
    tardies: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo],
    events: 2
  },
  {
    first_name: 'Arlecchino',
    last_name: 'ZZanni',
    homeroom: 'Test 1',
    id: 3,
    absences: [],
    tardies: [],
    events: 0
  },
  {
    first_name: 'Colombina',
    last_name: 'Zanni',
    homeroom: 'Test 2',
    id: 4,
    absences: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo, testEvents.oneYearAgo],
    tardies: [testEvents.thisMonth],
    events: 3
  },
  {
    first_name: 'Scaramuccia',
    last_name: 'Avecchi',
    homeroom: 'Test 2',
    id: 5,
    absences: [testEvents.twoMonthsAgo, testEvents.threeMonthsAgo],
    tardies: [testEvents.oneYearAgo],
    events: 2
  },

  {
    first_name: 'Pulcinella',
    last_name: 'Vecchi',
    homeroom: null,
    id: 6,
    absences: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo],
    tardies: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo],
    events: 2
  }
];


export function schoolTardyEvents () {
  const oneMonthAgo = moment().subtract(1, 'months').format('YYYY-MM-DD');
  const threeMonthsAgo = moment().subtract(3, 'months').format('YYYY-MM-DD');
  const fourMonthsAgo = moment().subtract(4, 'months').format('YYYY-MM-DD');
  const oneYearAgo = moment().subtract(1, 'year').format('YYYY-MM-DD');
  let schoolTardyEvents = {};

  schoolTardyEvents[oneMonthAgo] = [testEvents.oneMonthAgo];
  schoolTardyEvents[threeMonthsAgo] = [testEvents.threeMonthsAgo];
  schoolTardyEvents[fourMonthsAgo] = [testEvents.fourMonthsAgo];
  schoolTardyEvents[oneYearAgo] = [testEvents.oneYearAgo];

  return schoolTardyEvents;
}

