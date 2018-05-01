import React from 'react';
import _ from 'lodash';
import {storiesOf} from '@storybook/react';
import BoxAndWhisker from './BoxAndWhisker';


storiesOf('components/BoxAndWhisker', module) // eslint-disable-line no-undef
  .add('all', () => {
    return (
      <div style={{display: 'flex', flexDirection: 'column', margin: 20, background: '3px solid black'}}>
       <BoxAndWhisker style={{width: 300}} values={[3, 5, 35, 97, 32]} />
       <BoxAndWhisker style={{width: 300}} values={_.range(0, 10).map(i => Math.round(Math.random() * 100))} />
       <BoxAndWhisker style={{width: 300}} values={_.range(0, 10).map(i => Math.round(Math.random() * 100))} />
       <BoxAndWhisker style={{width: 300}} values={_.range(0, 10).map(i => Math.round(Math.random() * 100))} />
       <BoxAndWhisker style={{width: 300}} values={_.range(0, 10).map(i => Math.round(Math.random() * 100))} />
       <BoxAndWhisker style={{width: 300}} values={_.range(0, 10).map(i => Math.round(Math.random() * 100))} />
      </div>
    );
  });