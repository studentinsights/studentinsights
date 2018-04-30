import React from 'react';
import {storiesOf} from '@storybook/react';
import Circle from './Circle';


storiesOf('components/Circle', module) // eslint-disable-line no-undef
  .add('all', () => {
    return (
      <div style={{display: 'flex', flexDirection: 'row', margin: 20}}>
       <Circle text={3} color="red" />
       <Circle text={5} color="#ccc" />
       <Circle text={9} color="orange"/>
      </div>
    );
  });