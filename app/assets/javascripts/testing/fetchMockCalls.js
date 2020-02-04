import fetchMock from 'fetch-mock/es5/client';

// There's some extra arguments that are internal to fetch-mock
// that we don't care about.  These removes them for assertions
// and keeps only [URL, requestOptions] for each call.
export default function fetchMockCalls() {
  return fetchMock.calls().map(call => call.slice(0, 2));
}

