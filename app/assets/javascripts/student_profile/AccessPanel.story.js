import React from 'react';
import {storiesOf} from '@storybook/react';
import {withDefaultNowContext} from '../testing/NowContainer';
import AccessPanel from './AccessPanel';
import {testProps} from './AccessPanel.test';


storiesOf('profile-v3/AccessPanel', module) // eslint-disable-line no-undef
  .add('all', () => {
    return (
      <div style={{display: 'flex', flexDirection: 'column', padding: 20, width: 700, border: '1px solid #333'}}>
        {withDefaultNowContext(<AccessPanel {...testProps()} />)}
      </div>
    );
  });