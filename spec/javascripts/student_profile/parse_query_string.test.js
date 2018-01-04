import parseQueryString from '../../../app/assets/javascripts/student_profile/parse_query_string.js';

describe('parseQueryString', () => {
  it('parses a string without crashing', () => {
    const result = parseQueryString('color=red&shape=round');

    expect(result).toEqual({"color": "red", "shape": "round"});
  });
});
