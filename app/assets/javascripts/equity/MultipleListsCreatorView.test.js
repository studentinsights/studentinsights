import {reordered} from './MultipleListsCreatorView';

it('#reordered', () => {
  const items = ['a', 'b', 'c', 'd', 'e'];
  expect(reordered(items, 2, 0)).toEqual(['c', 'a', 'b', 'd', 'e']);
  expect(reordered(items, 1, 4)).toEqual(['a', 'c', 'd', 'e', 'b']);
});
