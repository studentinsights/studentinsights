import React from 'react';
import {storiesOf} from '@storybook/react';
import {mockFetch, testProps, testRender} from './CohortChart.test';


storiesOf('reader_profile_january/CohortChart', module) // eslint-disable-line no-undef
  .add('default', () => {
    mockFetch();
    return (
      <div style={{width: 300, border: '1px dashed red', margin: 10}}>
        {testRender(testProps())}
      </div>
    );
  });