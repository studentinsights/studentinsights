import React from 'react';
import {toMomentFromTime} from '../../../app/assets/javascripts/helpers/toMoment';
import NowContainer from '../../../app/assets/javascripts/components/NowContainer';


export const TEST_TIME_STRING = '2018-03-13T11:03:06.123Z';

// For use with Enzyme's shallow renderer
export function testContext(options = {}) {
  const timeString = options.timeString || TEST_TIME_STRING;
  return {
    nowFn() { return toMomentFromTime(timeString); }
  };
}

// Helper to freeze the clock during tests
export function withNowContext(timeString, children) {
  return (
    <NowContainer nowFn={() => toMomentFromTime(timeString)}>
      {children}
    </NowContainer>
  );
}

// Keep generic "now" value during most tests
export function withDefaultNowContext(children) {
  return withNowContext(TEST_TIME_STRING, children);
}

export default NowContainer;