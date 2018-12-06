import {mergeAtPath} from './mergeAtPath';

it('mergeAtPath', () => {
  const obj = {
    foo: {
      bar: {
        baz: 'hi'
      }
    }
  };
  expect(mergeAtPath(obj, ['foo', 'bar'], { mib: 'yah'})).toEqual({
    "foo":{
      "bar": {
        "baz": "hi",
        "mib": "yah"
      }
    }
  });
});
