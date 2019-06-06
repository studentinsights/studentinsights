import {toMoment} from './toMoment';
import {adjustedGrade} from './gradeText';


it('#adjustedGrade works', () => {
  expect(adjustedGrade(2017, '3', toMoment('3/5/2018'))).toEqual('3');
  expect(adjustedGrade(2016, '3', toMoment('3/5/2018'))).toEqual('2');
  expect(adjustedGrade(2015, '3', toMoment('3/5/2018'))).toEqual('1');
  expect(adjustedGrade(2014, '3', toMoment('3/5/2018'))).toEqual('KF');
  expect(adjustedGrade(2013, '3', toMoment('3/5/2018'))).toEqual('PK');
});
