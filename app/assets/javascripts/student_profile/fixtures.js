import {
  serviceTypesIndex,
  eventNoteTypesIndex
} from '../../../../spec/javascripts/fixtures/database_constants.jsx';

// assuming static time for specs
export const nowMoment = moment('2016-02-11T10:15:00');

export const feedForTestingNotes = {
  "event_notes": [
    {
      "id": 3,
      "student_id": 5,
      "educator_id": 1,
      "event_note_type_id": 301,
      "text": "Awesome!",
      "recorded_at": "2016-02-26T22:20:55.398Z",
      "created_at": "2016-02-26T22:20:55.416Z",
      "updated_at": "2016-02-26T22:20:55.416Z",
      "is_restricted": false,
      "event_note_revisions": [],
      "attachments": [
        { id: 42, url: "https://www.example.com/studentwork" },
        { id: 47, url: "https://www.example.com/morestudentwork" }
      ]
    },
    {
      "id": 4,
      "student_id": 5,
      "educator_id": 1,
      "event_note_type_id": 301,
      "text": "Sweet! (Restricted)",
      "recorded_at": "2016-02-27T19:23:26.835Z",
      "created_at": "2016-02-27T19:23:26.836Z",
      "updated_at": "2016-02-27T19:23:26.836Z",
      "is_restricted": true,
      "event_note_revisions": [],
      "attachments": []
    }
  ],
  "services": {
    "active": [
      {
        "id": 133,
        "service_type_id": 503,
        "recorded_by_educator_id": 1,
        "provided_by_educator_id": 1,
        "date_started": "2016-02-09",
        "date_discontinued": null,
        "discontinued_by_educator_id": 1
      },
      {
        "id": 134,
        "service_type_id": 506,
        "recorded_by_educator_id": 1,
        "provided_by_educator_id": 1,
        "date_started": "2016-02-08",
        "date_discontinued": null,
        "discontinued_by_educator_id": 1
      }
    ],
    "discontinued": []
  },
  "deprecated": {
    "interventions": [
      {
        "id": 1,
        "name": "Behavior Plan",
        "intervention_type_id": 24,
        "comment": "bar",
        "goal": "increase growth percentile",
        "start_date": "October 27, 2010",
        "start_date_timestamp": "2010-10-27",
        "end_date": "November 10, 2010",
        "educator_email": "demo@example.com",
        "educator_id": 1
      },
      {
        "id": 2,
        "name": "Attendance Officer",
        "intervention_type_id": 21,
        "comment": "whatever",
        "goal": "increase growth percentile",
        "start_date": "December 11, 2010",
        "start_date_timestamp": "2010-12-11",
        "end_date": "December 25, 2010",
        "educator_email": "demo@example.com",
        "educator_id": 1
      }
    ]
  }
};

export const currentEducator = {
  "id": 1,
  "email": "demo@example.com",
  "created_at": "2016-02-11T14:41:36.284Z",
  "updated_at": "2016-02-11T15:38:22.288Z",
  "admin": true,
  "phone": null,
  "full_name": null,
  "state_id": null,
  "local_id": "350",
  "staff_type": null,
  "school_id": 1,
  "schoolwide_access": true,
  "grade_level_access": [],
  "restricted_to_sped_students": false,
  "restricted_to_english_language_learners": false
};

export const studentProfile = {
  "serviceTypesIndex": serviceTypesIndex,
  "eventNoteTypesIndex": eventNoteTypesIndex,
  "dibels": [],
  "student": {
    "id": 23,
    "grade": "5",
    "hispanic_latino": false,
    "race": "A",
    "free_reduced_lunch": "Not Eligible",
    "date_of_birth": "2008-05-23T00:00:00.000Z",
    "created_at": "2016-02-11T14:41:52.437Z",
    "updated_at": "2016-02-11T14:41:59.433Z",
    "homeroom_id": 2,
    "first_name": "Daisy",
    "last_name": "Poppins",
    "state_id": null,
    "enrollment_status": "Active",
    "home_language": "English",
    "school_id": 1,
    "student_address": "1 Memorial Dr, Cambridge, MA 02142",
    "primary_phone": "999-999-9999 C-Mom",
    "primary_email": "parent@example.com",
    "registration_date": null,
    "local_id": "000816",
    "program_assigned": "Reg Ed",
    "sped_placement": null,
    "disability": null,
    "sped_level_of_need": null,
    "student_risk_level": {"id":5,"student_id":5,"level":3,"created_at":"2016-02-27T20:13:19.158Z","updated_at":"2016-02-27T20:13:19.167Z","mcas_math_risk_level":3,"star_math_risk_level":0,"mcas_ela_risk_level":2,"star_reading_risk_level":0,"limited_english_proficiency_risk_level":null},
    "plan_504": "Not 504",
    "limited_english_proficiency": "Fluent",
    "most_recent_mcas_math_growth": 16,
    "most_recent_mcas_ela_growth": 14,
    "most_recent_mcas_math_performance": "NI",
    "most_recent_mcas_ela_performance": "W",
    "most_recent_mcas_math_scaled": 248,
    "most_recent_mcas_ela_scaled": 230,
    "most_recent_star_reading_percentile": 39,
    "most_recent_star_math_percentile": 89,
    "interventions": [
      {
        "id": 7,
        "student_id": 23,
        "intervention_type_id": 26,
        "comment": "whatever",
        "start_date": "2010-10-01",
        "end_date": "2010-10-15",
        "created_at": "2016-02-11T14:41:52.609Z",
        "updated_at": "2016-02-11T14:41:52.609Z",
        "educator_id": 1,
        "number_of_hours": 3,
        "school_year_id": 1,
        "goal": "increase growth percentile",
        "student_school_year_id": 160,
        "custom_intervention_name": null
      },
      {
        "id": 8,
        "student_id": 23,
        "intervention_type_id": 34,
        "comment": "bar",
        "start_date": "2010-11-26",
        "end_date": "2010-12-10",
        "created_at": "2016-02-11T14:41:52.626Z",
        "updated_at": "2016-02-11T14:41:52.626Z",
        "educator_id": 1,
        "number_of_hours": 1,
        "school_year_id": 1,
        "goal": "increase growth percentile",
        "student_school_year_id": 160,
        "custom_intervention_name": null
      },
      {
        "id": 9,
        "student_id": 23,
        "intervention_type_id": 26,
        "comment": "whatever",
        "start_date": "2011-01-12",
        "end_date": "2011-01-26",
        "created_at": "2016-02-11T14:41:52.644Z",
        "updated_at": "2016-02-11T14:41:52.644Z",
        "educator_id": 1,
        "number_of_hours": 3,
        "school_year_id": 1,
        "goal": "pass assessment",
        "student_school_year_id": 160,
        "custom_intervention_name": null
      },
      {
        "id": 10,
        "student_id": 23,
        "intervention_type_id": 46,
        "comment": "foo",
        "start_date": "2011-02-21",
        "end_date": "2011-03-07",
        "created_at": "2016-02-11T14:41:52.658Z",
        "updated_at": "2016-02-11T14:41:52.658Z",
        "educator_id": 1,
        "number_of_hours": 2,
        "school_year_id": 1,
        "goal": "increase growth percentile",
        "student_school_year_id": 160,
        "custom_intervention_name": null
      },
      {
        "id": 11,
        "student_id": 23,
        "intervention_type_id": 27,
        "comment": "whatever",
        "start_date": "2011-04-05",
        "end_date": "2011-04-19",
        "created_at": "2016-02-11T14:41:52.679Z",
        "updated_at": "2016-02-11T14:41:52.679Z",
        "educator_id": 1,
        "number_of_hours": 3,
        "school_year_id": 1,
        "goal": "reduce behavior",
        "student_school_year_id": 160,
        "custom_intervention_name": null
      },
      {
        "id": 12,
        "student_id": 23,
        "intervention_type_id": 45,
        "comment": "whatever",
        "start_date": "2011-05-11",
        "end_date": "2011-05-25",
        "created_at": "2016-02-11T14:41:52.692Z",
        "updated_at": "2016-02-11T14:41:52.692Z",
        "educator_id": 1,
        "number_of_hours": 2,
        "school_year_id": 1,
        "goal": "pass assessment",
        "student_school_year_id": 160,
        "custom_intervention_name": null
      },
      {
        "id": 13,
        "student_id": 23,
        "intervention_type_id": 33,
        "comment": "foo",
        "start_date": "2011-06-30",
        "end_date": "2011-07-14",
        "created_at": "2016-02-11T14:41:52.708Z",
        "updated_at": "2016-02-11T14:41:52.708Z",
        "educator_id": 1,
        "number_of_hours": 4,
        "school_year_id": 1,
        "goal": "pass assessment",
        "student_school_year_id": 160,
        "custom_intervention_name": null
      },
      {
        "id": 14,
        "student_id": 23,
        "intervention_type_id": 34,
        "comment": "bar",
        "start_date": "2011-07-31",
        "end_date": "2011-08-14",
        "created_at": "2016-02-11T14:41:52.722Z",
        "updated_at": "2016-02-11T14:41:52.722Z",
        "educator_id": 1,
        "number_of_hours": 1,
        "school_year_id": 1,
        "goal": "increase growth percentile",
        "student_school_year_id": 160,
        "custom_intervention_name": null
      },
      {
        "id": 15,
        "student_id": 23,
        "intervention_type_id": 41,
        "comment": "foo",
        "start_date": "2011-09-18",
        "end_date": "2011-10-02",
        "created_at": "2016-02-11T14:41:52.737Z",
        "updated_at": "2016-02-11T14:41:52.737Z",
        "educator_id": 1,
        "number_of_hours": 7,
        "school_year_id": 5,
        "goal": "increase growth percentile",
        "student_school_year_id": 159,
        "custom_intervention_name": null
      },
      {
        "id": 16,
        "student_id": 23,
        "intervention_type_id": 23,
        "comment": "foo",
        "start_date": "2011-10-18",
        "end_date": "2011-11-01",
        "created_at": "2016-02-11T14:41:52.751Z",
        "updated_at": "2016-02-11T14:41:52.751Z",
        "educator_id": 1,
        "number_of_hours": 5,
        "school_year_id": 5,
        "goal": "increase growth percentile",
        "student_school_year_id": 159,
        "custom_intervention_name": null
      },
      {
        "id": 17,
        "student_id": 23,
        "intervention_type_id": 20,
        "comment": "bar",
        "start_date": "2011-12-12",
        "end_date": "2011-12-26",
        "created_at": "2016-02-11T14:41:52.764Z",
        "updated_at": "2016-02-11T14:41:52.764Z",
        "educator_id": 1,
        "number_of_hours": 6,
        "school_year_id": 5,
        "goal": "increase growth percentile",
        "student_school_year_id": 159,
        "custom_intervention_name": null
      },
      {
        "id": 18,
        "student_id": 23,
        "intervention_type_id": 21,
        "comment": "foo",
        "start_date": "2012-02-08",
        "end_date": "2012-02-22",
        "created_at": "2016-02-11T14:41:52.777Z",
        "updated_at": "2016-02-11T14:41:52.777Z",
        "educator_id": 1,
        "number_of_hours": 4,
        "school_year_id": 5,
        "goal": "reduce behavior",
        "student_school_year_id": 159,
        "custom_intervention_name": null
      },
      {
        "id": 19,
        "student_id": 23,
        "intervention_type_id": 21,
        "comment": "foo",
        "start_date": "2012-04-07",
        "end_date": "2012-04-21",
        "created_at": "2016-02-11T14:41:52.790Z",
        "updated_at": "2016-02-11T14:41:52.790Z",
        "educator_id": 1,
        "number_of_hours": 7,
        "school_year_id": 5,
        "goal": "increase growth percentile",
        "student_school_year_id": 159,
        "custom_intervention_name": null
      },
      {
        "id": 20,
        "student_id": 23,
        "intervention_type_id": 46,
        "comment": "whatever",
        "start_date": "2012-05-24",
        "end_date": "2012-06-07",
        "created_at": "2016-02-11T14:41:52.804Z",
        "updated_at": "2016-02-11T14:41:52.804Z",
        "educator_id": 1,
        "number_of_hours": 7,
        "school_year_id": 5,
        "goal": "increase growth percentile",
        "student_school_year_id": 159,
        "custom_intervention_name": null
      },
      {
        "id": 21,
        "student_id": 23,
        "intervention_type_id": 45,
        "comment": "bar",
        "start_date": "2012-07-02",
        "end_date": "2012-07-16",
        "created_at": "2016-02-11T14:41:52.818Z",
        "updated_at": "2016-02-11T14:41:52.818Z",
        "educator_id": 1,
        "number_of_hours": 3,
        "school_year_id": 5,
        "goal": "pass assessment",
        "student_school_year_id": 159,
        "custom_intervention_name": null
      },
      {
        "id": 22,
        "student_id": 23,
        "intervention_type_id": 28,
        "comment": "whatever",
        "start_date": "2012-08-21",
        "end_date": "2012-09-04",
        "created_at": "2016-02-11T14:41:52.833Z",
        "updated_at": "2016-02-11T14:41:52.833Z",
        "educator_id": 1,
        "number_of_hours": 7,
        "school_year_id": 6,
        "goal": "pass assessment",
        "student_school_year_id": 158,
        "custom_intervention_name": null
      },
      {
        "id": 23,
        "student_id": 23,
        "intervention_type_id": 44,
        "comment": "bar",
        "start_date": "2012-10-13",
        "end_date": "2012-10-27",
        "created_at": "2016-02-11T14:41:52.846Z",
        "updated_at": "2016-02-11T14:41:52.846Z",
        "educator_id": 1,
        "number_of_hours": 8,
        "school_year_id": 6,
        "goal": "reduce behavior",
        "student_school_year_id": 158,
        "custom_intervention_name": null
      }
    ],
    "absences_count": 15,
    "tardies_count": 23,
    "school_name": "Arthur D Healey",
    "homeroom_name": "102",
    "discipline_incidents_count": 0
  },
  "notes": [
    {
      "id": 19,
      "content": "We talked with an outside therapist.",
      "educator_email": "demo@example.com",
      "educator_id":1,
      "created_at_timestamp": "2016-02-11T14:41:52.857Z",
      "created_at": "February 11, 2016"
    },
    {
      "id": 20,
      "content": "We talked with the family.",
      "educator_email": "demo@example.com",
      "educator_id":1,
      "created_at_timestamp": "2016-02-11T14:41:52.861Z",
      "created_at": "February 11, 2016"
    },
    {
      "id": 21,
      "content": "We talked with an outside therapist.",
      "educator_email": "demo@example.com",
      "educator_id":1,
      "created_at_timestamp": "2016-02-11T14:41:52.864Z",
      "created_at": "February 11, 2016"
    },
    {
      "id": 22,
      "content": "We talked with an outside therapist.",
      "educator_email": "demo@example.com",
      "educator_id":1,
      "created_at_timestamp": "2016-02-11T14:41:52.868Z",
      "created_at": "February 11, 2016"
    },
    {
      "id": 23,
      "content": "We talked with an outside therapist.",
      "educator_email": "demo@example.com",
      "educator_id":1,
      "created_at_timestamp": "2016-02-11T14:41:52.872Z",
      "created_at": "February 11, 2016"
    },
    {
      "id": 24,
      "content": "We talked with the family.",
      "educator_email": "demo@example.com",
      "educator_id":1,
      "created_at_timestamp": "2016-02-11T14:41:52.875Z",
      "created_at": "February 11, 2016"
    },
    {
      "id": 25,
      "content": "We talked with the family.",
      "educator_email": "demo@example.com",
      "educator_id":1,
      "created_at_timestamp": "2016-02-11T14:41:52.879Z",
      "created_at": "February 11, 2016"
    }
  ],
  "feed": {
    "event_notes": [
      {
        "id": 1,
        "student_id": 6,
        "educator_id": 1,
        "event_note_type_id": 302,
        "text": "okay!",
        "recorded_at": "2016-02-11T21:28:02.102Z",
        "created_at": "2016-02-11T21:28:02.103Z",
        "updated_at": "2016-02-11T21:28:02.103Z",
        "event_note_revisions": [],
        "attachments": []
      },
      {
        "id": 2,
        "student_id": 6,
        "educator_id": 1,
        "event_note_type_id": 302,
        "text": "cool!",
        "recorded_at": "2016-02-11T21:29:18.166Z",
        "created_at": "2016-02-11T21:29:18.167Z",
        "updated_at": "2016-02-11T21:29:18.167Z",
        "event_note_revisions": [],
        "attachments": []
      },
      {
        "id": 3,
        "student_id": 6,
        "educator_id": 1,
        "event_note_type_id": 300,
        "text": "sweet",
        "recorded_at": "2016-02-11T21:29:30.287Z",
        "created_at": "2016-02-11T21:29:30.288Z",
        "updated_at": "2016-02-11T21:29:30.288Z",
        "event_note_revisions": [],
        "attachments": []
      }
    ],
    "services": {
      "active": [
        {
          "id": 133,
          "service_type_id": 503,
          "recorded_by_educator_id": 1,
          "provided_by_educator_id": 1,
          "date_started": "2016-02-09"
        },
        {
          "id": 134,
          "service_type_id": 506,
          "recorded_by_educator_id": 1,
          "provided_by_educator_id": 1,
          "date_started": "2016-02-09"
        }
      ],
      "discontinued": []
    },
    "deprecated": {
      "notes": [
        {
          "id": 19,
          "content": "We talked with an outside therapist.",
          "educator_email": "demo@example.com",
          "educator_id": 1,
          "created_at_timestamp": "2016-02-11T14:41:52.857Z",
          "created_at": "February 11, 2016"
        },
        {
          "id": 20,
          "content": "We talked with the family.",
          "educator_email": "demo@example.com",
          "educator_id": 1,
          "created_at_timestamp": "2016-02-11T14:41:52.861Z",
          "created_at": "February 11, 2016"
        },
        {
          "id": 21,
          "content": "We talked with an outside therapist.",
          "educator_email": "demo@example.com",
          "educator_id": 1,
          "created_at_timestamp": "2016-02-11T14:41:52.864Z",
          "created_at": "February 11, 2016"
        },
        {
          "id": 22,
          "content": "We talked with an outside therapist.",
          "educator_email": "demo@example.com",
          "educator_id": 1,
          "created_at_timestamp": "2016-02-11T14:41:52.868Z",
          "created_at": "February 11, 2016"
        },
        {
          "id": 23,
          "content": "We talked with an outside therapist.",
          "educator_email": "demo@example.com",
          "educator_id": 1,
          "created_at_timestamp": "2016-02-11T14:41:52.872Z",
          "created_at": "February 11, 2016"
        },
        {
          "id": 24,
          "content": "We talked with the family.",
          "educator_email": "demo@example.com",
          "educator_id": 1,
          "created_at_timestamp": "2016-02-11T14:41:52.875Z",
          "created_at": "February 11, 2016"
        },
        {
          "id": 25,
          "content": "We talked with the family.",
          "educator_email": "demo@example.com",
          "educator_id": 1,
          "created_at_timestamp": "2016-02-11T14:41:52.879Z",
          "created_at": "February 11, 2016"
        }
      ],
      "interventions": [
        {
          "id": 7,
          "name": "Classroom Academic Intervention",
          "comment": "whatever",
          "goal": "increase growth percentile",
          "start_date": "October  1, 2010",
          "start_date_timestamp": "2010-10-1",
          "end_date": "October 15, 2010",
          "educator_email": "demo@example.com",
          "educator_id": 1,
        },
        {
          "id": 8,
          "name": "MTSS Referral",
          "comment": "bar",
          "goal": "increase growth percentile",
          "start_date": "November 26, 2010",
          "start_date_timestamp": "2010-11-26",
          "end_date": "December 10, 2010",
          "educator_email": "demo@example.com",
          "educator_id": 1,
        },
        {
          "id": 9,
          "name": "Classroom Academic Intervention",
          "comment": "whatever",
          "goal": "pass assessment",
          "start_date": "January 12, 2011",
          "start_date_timestamp": "2011-01-12",
          "end_date": "January 26, 2011",
          "educator_email": "demo@example.com",
          "educator_id": 1,
        },
        {
          "id": 10,
          "name": "Other ",
          "comment": "foo",
          "goal": "increase growth percentile",
          "start_date": "February 21, 2011",
          "start_date_timestamp": "2011-02-21",
          "end_date": "March  7, 2011",
          "educator_email": "demo@example.com",
          "educator_id": 1,
        },
        {
          "id": 11,
          "name": "Classroom Behavior Intervention",
          "comment": "whatever",
          "goal": "reduce behavior",
          "start_date": "April  5, 2011",
          "start_date_timestamp": "2011-04-11",
          "end_date": "April 19, 2011",
          "educator_email": "demo@example.com",
          "educator_id": 1,
        },
        {
          "id": 12,
          "name": "51a Filing",
          "comment": "whatever",
          "goal": "pass assessment",
          "start_date": "May 11, 2011",
          "start_date_timestamp": "2011-05-11",
          "end_date": "May 25, 2011",
          "educator_email": "demo@example.com",
          "educator_id": 1,
        },
        {
          "id": 13,
          "name": "Mobile Crisis Referral",
          "comment": "foo",
          "goal": "pass assessment",
          "start_date": "June 30, 2011",
          "start_date_timestamp": "2011-06-30",
          "end_date": "July 14, 2011",
          "educator_email": "demo@example.com",
          "educator_id": 1,
        },
        {
          "id": 14,
          "name": "MTSS Referral",
          "comment": "bar",
          "goal": "increase growth percentile",
          "start_date": "July 31, 2011",
          "start_date_timestamp": "2011-07-31",
          "end_date": "August 14, 2011",
          "educator_email": "demo@example.com",
          "educator_id": 1,
        },
        {
          "id": 15,
          "name": "Reading Tutor",
          "comment": "foo",
          "goal": "increase growth percentile",
          "start_date": "September 18, 2011",
          "start_date_timestamp": "2011-09-18",
          "end_date": "October  2, 2011",
          "educator_email": "demo@example.com",
          "educator_id": 1,
        },
        {
          "id": 16,
          "name": "Behavior Contract",
          "comment": "foo",
          "goal": "increase growth percentile",
          "start_date": "October 18, 2011",
          "start_date_timestamp": "2011-10-18",
          "end_date": "November  1, 2011",
          "educator_email": "demo@example.com",
          "educator_id": 1,
        },
        {
          "id": 17,
          "name": "After-School Tutoring (ATP)",
          "comment": "bar",
          "goal": "increase growth percentile",
          "start_date": "December 12, 2011",
          "start_date_timestamp": "2011-12-12",
          "end_date": "December 26, 2011",
          "educator_email": "demo@example.com",
          "educator_id": 1,
        },
        {
          "id": 18,
          "name": "Attendance Officer",
          "comment": "foo",
          "goal": "reduce behavior",
          "start_date": "February  8, 2012",
          "start_date_timestamp": "2012-02-08",
          "end_date": "February 22, 2012",
          "educator_email": "demo@example.com",
          "educator_id": 1,
        },
        {
          "id": 19,
          "name": "Attendance Officer",
          "comment": "foo",
          "goal": "increase growth percentile",
          "start_date": "April  7, 2012",
          "start_date_timestamp": "2012-04-07",
          "end_date": "April 21, 2012",
          "educator_email": "demo@example.com",
          "educator_id": 1,
        },
        {
          "id": 20,
          "name": "Other ",
          "comment": "whatever",
          "goal": "increase growth percentile",
          "start_date": "May 24, 2012",
          "start_date_timestamp": "2012-05-24",
          "end_date": "June  7, 2012",
          "educator_email": "demo@example.com",
          "educator_id": 1,
        },
        {
          "id": 21,
          "name": "51a Filing",
          "comment": "bar",
          "goal": "pass assessment",
          "start_date": "July  2, 2012",
          "start_date_timestamp": "2012-07-12",
          "end_date": "July 16, 2012",
          "educator_email": "demo@example.com",
          "educator_id": 1,
        },
        {
          "id": 22,
          "name": "Community Schools",
          "comment": "whatever",
          "goal": "pass assessment",
          "start_date": "August 21, 2012",
          "start_date_timestamp": "2012-08-21",
          "end_date": "September  4, 2012",
          "educator_email": "demo@example.com",
          "educator_id": 1,
        },
        {
          "id": 23,
          "name": "X Block Tutor",
          "comment": "bar",
          "goal": "reduce behavior",
          "start_date": "October 13, 2012",
          "start_date_timestamp": "2012-10-13",
          "end_date": "October 27, 2012",
          "educator_email": "demo@example.com",
          "educator_id": 1,
        }
      ]
    }
  },
  "educatorsIndex": {
    "1": {
      "id": 1,
      "email": "demo@example.com",
      "created_at": "2016-02-11T14:41:36.284Z",
      "updated_at": "2016-02-11T15:38:22.288Z",
      "admin": true,
      "phone": null,
      "full_name": null,
      "state_id": null,
      "local_id": "350",
      "staff_type": null,
      "school_id": 1,
      "schoolwide_access": true,
      "grade_level_access": [],
      "restricted_to_sped_students": false,
      "restricted_to_english_language_learners": false
    },
    "2": {
      "id": 2,
      "email": "fake-fifth-grade@example.com",
      "created_at": "2016-02-11T14:41:36.354Z",
      "updated_at": "2016-02-11T14:41:36.354Z",
      "admin": false,
      "phone": null,
      "full_name": null,
      "state_id": null,
      "local_id": "450",
      "staff_type": null,
      "school_id": 1,
      "schoolwide_access": false,
      "grade_level_access": [],
      "restricted_to_sped_students": false,
      "restricted_to_english_language_learners": false
    }
  },
  "currentEducator": currentEducator,
  "chartData": {
    "star_series_math_percentile": [
      [
        2010,
        10,
        9,
        78
      ],
      [
        2010,
        11,
        9,
        87
      ],
      [
        2010,
        12,
        17,
        98
      ],
      [
        2011,
        2,
        9,
        100
      ],
      [
        2011,
        3,
        27,
        100
      ],
      [
        2011,
        5,
        12,
        92
      ],
      [
        2011,
        6,
        30,
        79
      ],
      [
        2011,
        8,
        6,
        82
      ],
      [
        2011,
        9,
        29,
        86
      ],
      [
        2011,
        11,
        15,
        78
      ],
      [
        2011,
        12,
        19,
        90
      ],
      [
        2012,
        1,
        25,
        89
      ]
    ],
    "star_series_reading_percentile": [
      [
        2010,
        10,
        18,
        61
      ],
      [
        2010,
        12,
        2,
        64
      ],
      [
        2011,
        1,
        4,
        74
      ],
      [
        2011,
        2,
        8,
        68
      ],
      [
        2011,
        3,
        27,
        56
      ],
      [
        2011,
        5,
        9,
        47
      ],
      [
        2011,
        6,
        24,
        59
      ],
      [
        2011,
        8,
        13,
        46
      ],
      [
        2011,
        10,
        8,
        33
      ],
      [
        2011,
        12,
        5,
        39
      ],
      [
        2012,
        1,
        27,
        27
      ],
      [
        2012,
        3,
        26,
        39
      ]
    ],
    "mcas_series_math_scaled": [
      [
        2010,
        5,
        15,
        237
      ],
      [
        2011,
        5,
        15,
        277
      ],
      [
        2012,
        5,
        15,
        272
      ],
      [
        2014,
        5,
        15,
        217
      ],
      [
        2015,
        5,
        15,
        248
      ]
    ],
    "mcas_series_ela_scaled": [
      [
        2010,
        5,
        15,
        218
      ],
      [
        2012,
        5,
        15,
        208
      ],
      [
        2013,
        5,
        15,
        241
      ],
      [
        2014,
        5,
        15,
        255
      ],
      [
        2015,
        5,
        15,
        230
      ]
    ],
    "mcas_series_math_growth": [
      [
        2010,
        5,
        15,
        64
      ],
      [
        2011,
        5,
        15,
        12
      ],
      [
        2012,
        5,
        15,
        80
      ],
      [
        2014,
        5,
        15,
        22
      ],
      [
        2015,
        5,
        15,
        16
      ]
    ],
    "mcas_series_ela_growth": [
      [
        2010,
        5,
        15,
        35
      ],
      [
        2012,
        5,
        15,
        82
      ],
      [
        2013,
        5,
        15,
        27
      ],
      [
        2014,
        5,
        15,
        51
      ],
      [
        2015,
        5,
        15,
        14
      ]
    ],
    "interventions": [
      {
        "start_date": {
          "year": 2010,
          "month": 10,
          "day": 1
        },
        "end_date": {
          "year": 2010,
          "month": 10,
          "day": 15
        },
        "name": "Classroom Academic Intervention"
      },
      {
        "start_date": {
          "year": 2010,
          "month": 11,
          "day": 26
        },
        "end_date": {
          "year": 2010,
          "month": 12,
          "day": 10
        },
        "name": "MTSS Referral"
      },
      {
        "start_date": {
          "year": 2011,
          "month": 1,
          "day": 12
        },
        "end_date": {
          "year": 2011,
          "month": 1,
          "day": 26
        },
        "name": "Classroom Academic Intervention"
      },
      {
        "start_date": {
          "year": 2011,
          "month": 2,
          "day": 21
        },
        "end_date": {
          "year": 2011,
          "month": 3,
          "day": 7
        },
        "name": "Other "
      },
      {
        "start_date": {
          "year": 2011,
          "month": 4,
          "day": 5
        },
        "end_date": {
          "year": 2011,
          "month": 4,
          "day": 19
        },
        "name": "Classroom Behavior Intervention"
      },
      {
        "start_date": {
          "year": 2011,
          "month": 5,
          "day": 11
        },
        "end_date": {
          "year": 2011,
          "month": 5,
          "day": 25
        },
        "name": "51a Filing"
      },
      {
        "start_date": {
          "year": 2011,
          "month": 6,
          "day": 30
        },
        "end_date": {
          "year": 2011,
          "month": 7,
          "day": 14
        },
        "name": "Mobile Crisis Referral"
      },
      {
        "start_date": {
          "year": 2011,
          "month": 7,
          "day": 31
        },
        "end_date": {
          "year": 2011,
          "month": 8,
          "day": 14
        },
        "name": "MTSS Referral"
      },
      {
        "start_date": {
          "year": 2011,
          "month": 9,
          "day": 18
        },
        "end_date": {
          "year": 2011,
          "month": 10,
          "day": 2
        },
        "name": "Reading Tutor"
      },
      {
        "start_date": {
          "year": 2011,
          "month": 10,
          "day": 18
        },
        "end_date": {
          "year": 2011,
          "month": 11,
          "day": 1
        },
        "name": "Behavior Contract"
      },
      {
        "start_date": {
          "year": 2011,
          "month": 12,
          "day": 12
        },
        "end_date": {
          "year": 2011,
          "month": 12,
          "day": 26
        },
        "name": "After-School Tutoring (ATP)"
      },
      {
        "start_date": {
          "year": 2012,
          "month": 2,
          "day": 8
        },
        "end_date": {
          "year": 2012,
          "month": 2,
          "day": 22
        },
        "name": "Attendance Officer"
      },
      {
        "start_date": {
          "year": 2012,
          "month": 4,
          "day": 7
        },
        "end_date": {
          "year": 2012,
          "month": 4,
          "day": 21
        },
        "name": "Attendance Officer"
      },
      {
        "start_date": {
          "year": 2012,
          "month": 5,
          "day": 24
        },
        "end_date": {
          "year": 2012,
          "month": 6,
          "day": 7
        },
        "name": "Other "
      },
      {
        "start_date": {
          "year": 2012,
          "month": 7,
          "day": 2
        },
        "end_date": {
          "year": 2012,
          "month": 7,
          "day": 16
        },
        "name": "51a Filing"
      },
      {
        "start_date": {
          "year": 2012,
          "month": 8,
          "day": 21
        },
        "end_date": {
          "year": 2012,
          "month": 9,
          "day": 4
        },
        "name": "Community Schools"
      },
      {
        "start_date": {
          "year": 2012,
          "month": 10,
          "day": 13
        },
        "end_date": {
          "year": 2012,
          "month": 10,
          "day": 27
        },
        "name": "X Block Tutor"
      }
    ]
  },
  "attendanceData": {
    "discipline_incidents": [],
    "tardies": [
      {
        "id": 593,
        "student_school_year_id": 155,
        "occurred_at": "2015-12-07T14:41:52.600Z",
        "created_at": "2016-02-11T14:41:52.601Z",
        "updated_at": "2016-02-11T14:41:52.601Z"
      },
      {
        "id": 592,
        "student_school_year_id": 155,
        "occurred_at": "2015-12-27T14:41:52.580Z",
        "created_at": "2016-02-11T14:41:52.580Z",
        "updated_at": "2016-02-11T14:41:52.580Z"
      },
      {
        "id": 591,
        "student_school_year_id": 155,
        "occurred_at": "2016-01-12T14:41:52.575Z",
        "created_at": "2016-02-11T14:41:52.576Z",
        "updated_at": "2016-02-11T14:41:52.576Z"
      },
      {
        "id": 590,
        "student_school_year_id": 155,
        "occurred_at": "2015-12-20T14:41:52.572Z",
        "created_at": "2016-02-11T14:41:52.572Z",
        "updated_at": "2016-02-11T14:41:52.572Z"
      },
      {
        "id": 589,
        "student_school_year_id": 155,
        "occurred_at": "2015-12-05T14:41:52.561Z",
        "created_at": "2016-02-11T14:41:52.562Z",
        "updated_at": "2016-02-11T14:41:52.562Z"
      },
      {
        "id": 588,
        "student_school_year_id": 155,
        "occurred_at": "2015-12-29T14:41:52.554Z",
        "created_at": "2016-02-11T14:41:52.555Z",
        "updated_at": "2016-02-11T14:41:52.555Z"
      },
      {
        "id": 587,
        "student_school_year_id": 155,
        "occurred_at": "2016-01-24T14:41:52.551Z",
        "created_at": "2016-02-11T14:41:52.552Z",
        "updated_at": "2016-02-11T14:41:52.552Z"
      },
      {
        "id": 586,
        "student_school_year_id": 155,
        "occurred_at": "2016-01-17T14:41:52.548Z",
        "created_at": "2016-02-11T14:41:52.548Z",
        "updated_at": "2016-02-11T14:41:52.548Z"
      },
      {
        "id": 585,
        "student_school_year_id": 155,
        "occurred_at": "2016-01-04T14:41:52.544Z",
        "created_at": "2016-02-11T14:41:52.545Z",
        "updated_at": "2016-02-11T14:41:52.545Z"
      },
      {
        "id": 584,
        "student_school_year_id": 155,
        "occurred_at": "2016-01-28T14:41:52.536Z",
        "created_at": "2016-02-11T14:41:52.537Z",
        "updated_at": "2016-02-11T14:41:52.537Z"
      },
      {
        "id": 583,
        "student_school_year_id": 155,
        "occurred_at": "2015-11-05T14:41:52.526Z",
        "created_at": "2016-02-11T14:41:52.527Z",
        "updated_at": "2016-02-11T14:41:52.527Z"
      },
      {
        "id": 582,
        "student_school_year_id": 155,
        "occurred_at": "2016-02-01T14:41:52.523Z",
        "created_at": "2016-02-11T14:41:52.524Z",
        "updated_at": "2016-02-11T14:41:52.524Z"
      },
      {
        "id": 581,
        "student_school_year_id": 155,
        "occurred_at": "2015-12-24T14:41:52.516Z",
        "created_at": "2016-02-11T14:41:52.517Z",
        "updated_at": "2016-02-11T14:41:52.517Z"
      },
      {
        "id": 580,
        "student_school_year_id": 155,
        "occurred_at": "2016-01-28T14:41:52.513Z",
        "created_at": "2016-02-11T14:41:52.513Z",
        "updated_at": "2016-02-11T14:41:52.513Z"
      },
      {
        "id": 579,
        "student_school_year_id": 155,
        "occurred_at": "2015-12-14T14:41:52.506Z",
        "created_at": "2016-02-11T14:41:52.507Z",
        "updated_at": "2016-02-11T14:41:52.507Z"
      },
      {
        "id": 578,
        "student_school_year_id": 155,
        "occurred_at": "2015-12-22T14:41:52.503Z",
        "created_at": "2016-02-11T14:41:52.503Z",
        "updated_at": "2016-02-11T14:41:52.503Z"
      },
      {
        "id": 577,
        "student_school_year_id": 155,
        "occurred_at": "2015-11-22T14:41:52.499Z",
        "created_at": "2016-02-11T14:41:52.500Z",
        "updated_at": "2016-02-11T14:41:52.500Z"
      },
      {
        "id": 576,
        "student_school_year_id": 155,
        "occurred_at": "2015-11-25T14:41:52.489Z",
        "created_at": "2016-02-11T14:41:52.489Z",
        "updated_at": "2016-02-11T14:41:52.489Z"
      },
      {
        "id": 575,
        "student_school_year_id": 155,
        "occurred_at": "2015-12-03T14:41:52.485Z",
        "created_at": "2016-02-11T14:41:52.486Z",
        "updated_at": "2016-02-11T14:41:52.486Z"
      },
      {
        "id": 574,
        "student_school_year_id": 155,
        "occurred_at": "2015-11-30T14:41:52.482Z",
        "created_at": "2016-02-11T14:41:52.482Z",
        "updated_at": "2016-02-11T14:41:52.482Z"
      },
      {
        "id": 573,
        "student_school_year_id": 155,
        "occurred_at": "2015-12-19T14:41:52.471Z",
        "created_at": "2016-02-11T14:41:52.471Z",
        "updated_at": "2016-02-11T14:41:52.471Z"
      },
      {
        "id": 572,
        "student_school_year_id": 155,
        "occurred_at": "2016-01-09T14:41:52.467Z",
        "created_at": "2016-02-11T14:41:52.468Z",
        "updated_at": "2016-02-11T14:41:52.468Z"
      },
      {
        "id": 571,
        "student_school_year_id": 155,
        "occurred_at": "2015-11-23T14:41:52.463Z",
        "created_at": "2016-02-11T14:41:52.464Z",
        "updated_at": "2016-02-11T14:41:52.464Z"
      }
    ],
    "absences": [
      {
        "id": 561,
        "student_school_year_id": 155,
        "occurred_at": "2015-11-17T14:41:52.597Z",
        "created_at": "2016-02-11T14:41:52.597Z",
        "updated_at": "2016-02-11T14:41:52.597Z"
      },
      {
        "id": 560,
        "student_school_year_id": 155,
        "occurred_at": "2015-12-02T14:41:52.593Z",
        "created_at": "2016-02-11T14:41:52.594Z",
        "updated_at": "2016-02-11T14:41:52.594Z"
      },
      {
        "id": 559,
        "student_school_year_id": 155,
        "occurred_at": "2015-12-18T14:41:52.589Z",
        "created_at": "2016-02-11T14:41:52.590Z",
        "updated_at": "2016-02-11T14:41:52.590Z"
      },
      {
        "id": 558,
        "student_school_year_id": 155,
        "occurred_at": "2016-02-04T14:41:52.585Z",
        "created_at": "2016-02-11T14:41:52.586Z",
        "updated_at": "2016-02-11T14:41:52.586Z"
      },
      {
        "id": 557,
        "student_school_year_id": 155,
        "occurred_at": "2016-02-08T14:41:52.568Z",
        "created_at": "2016-02-11T14:41:52.569Z",
        "updated_at": "2016-02-11T14:41:52.569Z"
      },
      {
        "id": 556,
        "student_school_year_id": 155,
        "occurred_at": "2016-01-06T14:41:52.565Z",
        "created_at": "2016-02-11T14:41:52.565Z",
        "updated_at": "2016-02-11T14:41:52.565Z"
      },
      {
        "id": 555,
        "student_school_year_id": 155,
        "occurred_at": "2015-12-14T14:41:52.558Z",
        "created_at": "2016-02-11T14:41:52.558Z",
        "updated_at": "2016-02-11T14:41:52.558Z"
      },
      {
        "id": 554,
        "student_school_year_id": 155,
        "occurred_at": "2015-11-26T14:41:52.540Z",
        "created_at": "2016-02-11T14:41:52.541Z",
        "updated_at": "2016-02-11T14:41:52.541Z"
      },
      {
        "id": 553,
        "student_school_year_id": 155,
        "occurred_at": "2016-01-14T14:41:52.531Z",
        "created_at": "2016-02-11T14:41:52.532Z",
        "updated_at": "2016-02-11T14:41:52.532Z"
      },
      {
        "id": 552,
        "student_school_year_id": 155,
        "occurred_at": "2015-12-22T14:41:52.520Z",
        "created_at": "2016-02-11T14:41:52.520Z",
        "updated_at": "2016-02-11T14:41:52.520Z"
      },
      {
        "id": 551,
        "student_school_year_id": 155,
        "occurred_at": "2015-11-13T14:41:52.509Z",
        "created_at": "2016-02-11T14:41:52.510Z",
        "updated_at": "2016-02-11T14:41:52.510Z"
      },
      {
        "id": 550,
        "student_school_year_id": 155,
        "occurred_at": "2016-01-13T14:41:52.496Z",
        "created_at": "2016-02-11T14:41:52.496Z",
        "updated_at": "2016-02-11T14:41:52.496Z"
      },
      {
        "id": 549,
        "student_school_year_id": 155,
        "occurred_at": "2015-12-31T14:41:52.492Z",
        "created_at": "2016-02-11T14:41:52.493Z",
        "updated_at": "2016-02-11T14:41:52.493Z"
      },
      {
        "id": 548,
        "student_school_year_id": 155,
        "occurred_at": "2016-01-16T14:41:52.478Z",
        "created_at": "2016-02-11T14:41:52.479Z",
        "updated_at": "2016-02-11T14:41:52.479Z"
      },
      {
        "id": 547,
        "student_school_year_id": 155,
        "occurred_at": "2015-12-29T14:41:52.474Z",
        "created_at": "2016-02-11T14:41:52.475Z",
        "updated_at": "2016-02-11T14:41:52.475Z"
      }
    ]
  }
};
