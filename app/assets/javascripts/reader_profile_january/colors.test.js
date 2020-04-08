import {
  ORANGE,
  GREEN,
  PRESENT,
  BLANK,
  pickBoxColor
} from './colors';


it('#pickBoxColor', () => {
  const mockDataPoint = {};
  expect(pickBoxColor(null, false)).toEqual(BLANK);
  expect(pickBoxColor(null, true)).toEqual(BLANK);
  expect(pickBoxColor(mockDataPoint, null)).toEqual(PRESENT);
  expect(pickBoxColor(mockDataPoint, false)).toEqual(GREEN);
  expect(pickBoxColor(mockDataPoint, true)).toEqual(ORANGE);
});
