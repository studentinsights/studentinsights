import {postTeacherUpdates, postPrincipalRevisions} from './api';
import fetchMock from 'fetch-mock/es5/client';
import {TEST_TIME_MOMENT} from '../../../../spec/javascripts/support/NowContainer';

beforeEach(() => {
  fetchMock.restore();
  fetchMock.post('express:/api/class_lists/:workspace_id/teacher_updated_class_list_json', {});
  fetchMock.post('express:/api/class_lists/:workspace_id/principal_revised_class_list_json', {});
});

it('#postTeacherUpdates', done => {
  const params = {
    workspaceId: 'foo-workspace-id',
    isSubmitted: false,
    schoolId: 4,
    gradeLevelNextYear: '3',
    authors: [{id: 9999, full_name: 'Disney, Uri'}],
    classroomsCount: 2,
    planText: 'plan!',
    studentIdsByRoom: {
      'room:unplaced': [102, 103],
      'room:0': [],
      'room:1': [101]
    },
    feedbackText: 'feedback!',
    principalNoteText: 'notes!',
    clientNowMs: TEST_TIME_MOMENT.unix()
  };

  // This is read off the page from rails, but not in test
  const options = { csrfToken: 'explicit-csrf-token-for-test' };

  // Make request and verify HTTP call
  postTeacherUpdates(params, options).then(response => {
    const calls = fetchMock.calls();
    expect(calls.length).toEqual(1);
    expect(calls[0][0]).toEqual('/api/class_lists/foo-workspace-id/teacher_updated_class_list_json');
    expect(calls[0][1].credentials).toEqual('same-origin');
    expect(calls[0][1].method).toEqual('POST');
    expect(calls[0][1].headers).toEqual({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': 'explicit-csrf-token-for-test'
    });
    expect(calls[0][1].body).toEqual(JSON.stringify({
      "workspace_id": "foo-workspace-id",
      "school_id": 4,
      "grade_level_next_year": "3",
      "submitted": false,
      "json": {
        "authors": [{"id": 9999,"full_name": "Disney, Uri"}],
        "classroomsCount": 2,
        "planText": "plan!",
        "studentIdsByRoom": {
          "room:unplaced": [102,103],
          "room:0": [],
          "room:1": [101]
        },
        "principalNoteText": "notes!",
        "feedbackText": "feedback!",
        "clientNowMs": TEST_TIME_MOMENT.unix()
      }
    }));
    done();
  });
});


it('#postPrincipalRevisions', done => {
  const params = {
    workspaceId: 'foo-workspace-id',
    clientNowMs: TEST_TIME_MOMENT.unix(),
    principalStudentIdsByRoom: {
      "room:unplaced":[],
      "room:0":[1, 2],
      "room:1":[3]
    },
    principalTeacherNamesByRoom: {
      "room:0":"Kevin",
      "room:1":"Alex",
    }
  };

  // This is read off the page from rails, but not in test
  const options = { csrfToken: 'explicit-csrf-token-for-test' };

  // Make request and verify HTTP call
  postPrincipalRevisions(params, options).then(response => {
    const calls = fetchMock.calls();
    expect(calls.length).toEqual(1);
    expect(calls[0][0]).toEqual('/api/class_lists/foo-workspace-id/principal_revised_class_list_json');
    expect(calls[0][1].credentials).toEqual('same-origin');
    expect(calls[0][1].method).toEqual('POST');
    expect(calls[0][1].headers).toEqual({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': 'explicit-csrf-token-for-test'
    });
    expect(calls[0][1].body).toEqual(JSON.stringify({
      "workspace_id": "foo-workspace-id",
      "principal_revisions_json": {
        "principalStudentIdsByRoom":{
          "room:unplaced":[],
          "room:0":[1, 2],
          "room:1":[3]
        },
        "principalTeacherNamesByRoom":{
          "room:0":"Kevin",
          "room:1":"Alex",
        },
        "clientNowMs":TEST_TIME_MOMENT.unix()
      }
    }));
    done();
  });
});
