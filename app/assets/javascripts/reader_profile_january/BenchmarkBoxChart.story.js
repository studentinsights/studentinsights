import React from 'react';
import {storiesOf} from '@storybook/react';
import {testProps, testRender} from './BenchmarkBoxChart.test';
import {renderRawDibelsScoreBoxFn} from './BenchmarkBoxChart';

storiesOf('reader_profile_january/BenchmarkBoxChart', module) // eslint-disable-line no-undef
  .add('default', () => (
    <div style={{width: 600, margin: 10}}>
      <div style={{padding: 20}}>
        <h2>renderDibelsBoxFn</h2>
        {testRender(testProps())}
      </div>
      <div style={{padding: 20}}>
        <h2>renderRawDibelsScoreBoxFn</h2>
        {testRender(testProps({renderBoxFn: renderRawDibelsScoreBoxFn}))}
      </div>
    </div>
  ));