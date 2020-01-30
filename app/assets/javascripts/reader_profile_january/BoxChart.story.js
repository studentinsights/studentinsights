import React from 'react';
import {storiesOf} from '@storybook/react';
import {testProps, testRender} from './BoxChart.test';


storiesOf('reader_profile_january/BoxChart', module) // eslint-disable-line no-undef
  .add('default', () => (
    <div style={{width: 300, border: '1px solid red', margin: 10}}>
      {testRender(testProps())}
    </div>
  ));