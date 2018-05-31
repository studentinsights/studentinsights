import {dibelsLevel} from './studentFilters';

it('#dibelsLevel', () => {
  
  
  expect(dibelsLevel({ performance_level: 'CORE' })).toEqual('core');
  expect(dibelsLevel({ performance_level: 'DIBELS: CORE NWFCS 63 WC 20' })).toEqual('core');
  expect(dibelsLevel({ performance_level: 'DIBELS: INT NWFCS 10 WC 0' })).toEqual('intensive');
  expect(dibelsLevel({ performance_level: 'Intensive' })).toEqual('intensive');
  expect(dibelsLevel({ performance_level: 'DIBELS: STRG NWFCS 41 WC 12' })).toEqual('strategic');
  expect(dibelsLevel({ performance_level: 'Strategic' })).toEqual('strategic');
});