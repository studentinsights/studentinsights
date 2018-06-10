import parseQueryString from './parseQueryString';

describe('parseQueryString', () => {
  it('parses a string without crashing', () => {
    const result = parseQueryString('color=red&shape=round');

    expect(result).toEqual({"color": "red", "shape": "round"});
  });
});
