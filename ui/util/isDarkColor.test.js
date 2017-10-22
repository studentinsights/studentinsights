import isDarkColor from './isDarkColor';

it('works', () => {
  expect(isDarkColor('white')).toEqual(false);
  expect(isDarkColor('darkred')).toEqual(true);
  expect(isDarkColor('black')).toEqual(true);
  expect(isDarkColor('yellow')).toEqual(false);
  expect(isDarkColor('rgb(240,240,240)')).toEqual(false);
  expect(isDarkColor('#eeeeee')).toEqual(false);
});