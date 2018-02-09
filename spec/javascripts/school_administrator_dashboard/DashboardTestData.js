
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
  oneYearAgo: {
    occurred_at: moment().subtract(1, 'year').format("YYYY-MM-DD HH:mm:sss Z"),
    student_id: 1,
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
    tardies: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo, testEvents.threeMonthsAgo]
  },
  {
    first_name: 'Pierrette',
    last_name: 'Zanni',
    homeroom: 'Test 1',
    id: 2,
    absences: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo],
    tardies: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo]
  },
  {
    first_name: 'Arlecchino',
    last_name: 'Zanni',
    homeroom: 'Test 1',
    id: 3,
    absences: [],
    tardies: []
  },
  {
    first_name: 'Colombina',
    last_name: 'Zanni',
    homeroom: 'Test 2',
    id: 4,
    absences: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo, testEvents.oneYearAgo],
    tardies: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo, testEvents.oneYearAgo]
  },
  {
    first_name: 'Scaramuccia',
    last_name: 'Vecchi',
    homeroom: 'Test 2',
    id: 5,
    absences: [testEvents.twoMonthsAgo, testEvents.threeMonthsAgo],
    tardies: [testEvents.twoMonthsAgo, testEvents.threeMonthsAgo]
  },
  {
    first_name: 'Pulcinella',
    last_name: 'Vecchi',
    homeroom: null,
    id: 6,
    absences: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo],
    tardies: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo]
  }
];
