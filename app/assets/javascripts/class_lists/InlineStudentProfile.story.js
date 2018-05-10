import React from 'react';
import {storiesOf} from '@storybook/react';
import {withDefaultNowContext} from '../../../../spec/javascripts/support/NowContainer';
import InlineStudentProfile from './InlineStudentProfile';
import {testProps} from './InlineStudentProfile.test';


storiesOf('classlists/InlineStudentProfile', module) // eslint-disable-line no-undef
  .add('test', () => {
    const props = testProps();
    return withDefaultNowContext(
      <div style={{width: '100%', background: '#333'}}>
        <div style={{position: 'relative', width: 660, left: 100, top: 100, border: '5px solid #333', background: 'white'}}>
          <InlineStudentProfile {...props} />
        </div>
      </div>
    );
  });
