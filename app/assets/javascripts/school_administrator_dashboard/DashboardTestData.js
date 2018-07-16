// Stubbed events for dashboard specs
export function createTestEvents(nowMoment) {
  return {
    oneMonthAgo: {
      occurred_at: nowMoment.clone().subtract(1, 'months').format(),
      excused: true,
      dismissed: false,
      student_id: 1,
    },
    twoMonthsAgo: {
      occurred_at: nowMoment.clone().subtract(2, 'months').format(),
      excused: false,
      dismissed: true,
      student_id: 1,
    },
    threeMonthsAgo: {
      occurred_at: nowMoment.clone().subtract(3, 'months').format(),
      excused: false,
      dismissed: false,
      student_id: 1,
    },
    fourMonthsAgo: {
      occurred_at: nowMoment.clone().subtract(4, 'months').format(),
      excused: false,
      dismissed: false,
      student_id: 1,
    },
    oneYearAgo: {
      occurred_at: nowMoment.clone().subtract(1, 'year').format(),
      excused: false,
      dismissed: false,
      student_id: 1,
    },
    thisMonth: {
      occurred_at: nowMoment.clone().format(),
      excused: false,
      dismissed: false,
      student_id: 1
    }
  };
}

// Stubbed students for dashboard specs
export function createStudents(nowMoment) {
  const testEvents = createTestEvents(nowMoment);
  return [{
    first_name: 'Pierrot',
    last_name: 'Zanni',
    homeroom_label: 'Test 1',
    grade: '4',
    id: 1,
    absences: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo, testEvents.threeMonthsAgo],
    tardies: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo, testEvents.threeMonthsAgo],
    events: 3,
    latest_note: {
      event_note_type_id: 300,
      recorded_at: testEvents.threeMonthsAgo.occurred_at
    }
  },
  {
    first_name: 'Pierrette',
    last_name: 'Zanni',
    homeroom_label: 'Test 1',
    grade: 'KF',
    id: 2,
    absences: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo],
    tardies: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo],
    events: 2,
    latest_note: null
  },
  {
    first_name: 'Arlecchino',
    last_name: 'ZZanni',
    homeroom_label: 'Test 1',
    grade: '4',
    id: 3,
    absences: [],
    tardies: [],
    events: 0,
    latest_note: null
  },
  {
    first_name: 'Colombina',
    last_name: 'Zanni',
    homeroom_label: 'Test 2',
    grade: '3',
    id: 4,
    absences: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo, testEvents.oneYearAgo],
    tardies: [testEvents.thisMonth],
    events: 3,
    latest_note: null
  },
  {
    first_name: 'Scaramuccia',
    last_name: 'Avecchi',
    homeroom_label: 'Test 2',
    grade: '4',
    id: 5,
    absences: [testEvents.twoMonthsAgo, testEvents.threeMonthsAgo],
    tardies: [testEvents.oneYearAgo],
    events: 2,
    latest_note: null
  },
  {
    first_name: 'Pulcinella',
    last_name: 'Vecchi',
    homeroom_label: 'No Homeroom',
    grade: '4',
    id: 6,
    absences: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo],
    tardies: [testEvents.oneMonthAgo, testEvents.twoMonthsAgo],
    events: 2,
    latest_note: null
  }];
}

export function createSchoolTardyEvents(nowMoment) {
  const testEvents = createTestEvents(nowMoment);

  const oneMonthAgo = nowMoment.clone().subtract(1, 'months').format('YYYY-MM-DD');
  const threeMonthsAgo = nowMoment.clone().subtract(3, 'months').format('YYYY-MM-DD');
  const fourMonthsAgo = nowMoment.clone().subtract(4, 'months').format('YYYY-MM-DD');
  const oneYearAgo = nowMoment.clone().subtract(1, 'year').format('YYYY-MM-DD');
  let schoolTardyEvents = {};

  schoolTardyEvents[oneMonthAgo] = [testEvents.oneMonthAgo];
  schoolTardyEvents[threeMonthsAgo] = [testEvents.threeMonthsAgo];
  schoolTardyEvents[fourMonthsAgo] = [testEvents.fourMonthsAgo];
  schoolTardyEvents[oneYearAgo] = [testEvents.oneYearAgo];

  return schoolTardyEvents;
}
