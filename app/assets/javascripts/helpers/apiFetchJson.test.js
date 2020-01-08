import fetchMock from 'fetch-mock/es5/client';
import {
  apiFetchJson,
  apiPostJson,
  apiPatchJson,
  apiPutJson,
  apiDeleteJson
} from './apiFetchJson';
import mockCsrfForTest from '../testing/mockCsrfForTest';


beforeEach(() => {
  fetchMock.restore();
  mockCsrfForTest('mocked-csrf-token');
});


it('#apiFetchJson', done => {
  fetchMock.get('/test-url', { responseFoo: 'baz' });

  apiFetchJson('/test-url', { queryFoo: 'bar' }).then(json => {
    expect(fetchMock.calls()).toEqual([[
      '/test-url',
      {
        "credentials": "same-origin",
        "headers": {
          "Accept": "application/json"
        },
        "method": "GET"
      }
    ]]);
    expect(json).toEqual({responseFoo: 'baz'});
    done();
  });
});

it('#apiFetchJson parses non-20x responses, rejecting Promise', done => {
  fetchMock.get('/test-url', {
    status: 403,
    body: {json_error: 'msg' }
  });

  apiFetchJson('/test-url', { queryFoo: 'bar' }).catch(json => {
    expect(fetchMock.calls()).toEqual([[
      '/test-url',
      {
        "credentials": "same-origin",
        "headers": {
          "Accept": "application/json"
        },
        "method": "GET"
      }
    ]]);
    expect(json).toEqual({json_error: 'msg'});
    done();
  });
});


it('#apiPostJson', done => {
  fetchMock.post('/test-url', { responseFoo: 'baz' });

  apiPostJson('/test-url', { bodyFoo: 'bar' }).then(json => {
    expect(fetchMock.calls()).toEqual([[
      '/test-url',
      {
        "body": "{\"bodyFoo\":\"bar\"}",
        "credentials": "same-origin",
        "headers": {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-CSRF-Token": 'mocked-csrf-token'
        },
        "method": "POST"
      }
    ]]);
    expect(json).toEqual({responseFoo: 'baz'});
    done();
  });
});

it('#apiPatchJson', done => {
  fetchMock.patch('/test-url', { responseFoo: 'baz' });

  apiPatchJson('/test-url', { bodyFoo: 'bar' }).then(json => {
    expect(fetchMock.calls()).toEqual([[
      '/test-url',
      {
        "body": "{\"bodyFoo\":\"bar\"}",
        "credentials": "same-origin",
        "headers": {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-CSRF-Token": 'mocked-csrf-token'
        },
        "method": "PATCH"
      }
    ]]);
    expect(json).toEqual({responseFoo: 'baz'});
    done();
  });
});

it('#apiPutJson', done => {
  fetchMock.put('/test-url', { responseFoo: 'baz' });

  apiPutJson('/test-url', { bodyFoo: 'bar' }).then(json => {
    expect(fetchMock.calls()).toEqual([[
      '/test-url',
      {
        "body": "{\"bodyFoo\":\"bar\"}",
        "credentials": "same-origin",
        "headers": {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-CSRF-Token": 'mocked-csrf-token'
        },
        "method": "PUT"
      }
    ]]);
    expect(json).toEqual({responseFoo: 'baz'});
    done();
  });
});

it('#apiDeleteJson', done => {
  fetchMock.delete('/test-url', { responseFoo: 'baz' });

  apiDeleteJson('/test-url').then(json => {
    expect(fetchMock.calls()).toEqual([[
      '/test-url',
      {
        "body": "{\"_method\":\"delete\",\"authenticity_token\":\"mocked-csrf-token\"}",
        "credentials": "same-origin",
        "headers": {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-CSRF-Token": 'mocked-csrf-token'
        },
        "method": "DELETE"
      }
    ]]);
    expect(json).toEqual({responseFoo: 'baz'});
    done();
  });
});