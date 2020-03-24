import React from 'react';
import {storiesOf} from '@storybook/react';
import {testProps, testRender} from './BoxChart.test';
import {renderRawDibelsScoreBoxFn} from './BoxChart';

storiesOf('reader_profile_january/BoxChart', module) // eslint-disable-line no-undef
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