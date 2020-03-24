import React from 'react';
import {storiesOf} from '@storybook/react';
import {mockFetch, testProps, testRender} from './BenchmarkCohortChart.test';


storiesOf('reader_profile_january/BenchmarkCohortChart', module) // eslint-disable-line no-undef
  .add('default', () => {
    mockFetch();
    return (
      <div style={{width: 300, border: '1px dashed red', margin: 10}}>
        {testRender(testProps())}
      </div>
    );
  });