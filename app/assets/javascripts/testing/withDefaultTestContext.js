import React from 'react';
import NowContainer, {testContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';

// Wraps a comment nowFn / districtKey test setup.
export default function withDefaultTestContext(children, context = {}) {
  const ctx = defaultTestContext(context);
  return (
    <NowContainer nowFn={ctx.nowFn}>)
      <PerDistrictContainer districtKey={ctx.districtKey}>
        {children}
      </PerDistrictContainer>
    </NowContainer>
  );
}

function defaultTestContext(context) {
  return {
    ...testContext(),
    districtKey: 'somerville',
    ...context
  };
}