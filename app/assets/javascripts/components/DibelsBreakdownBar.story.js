import React from 'react';
import {storiesOf} from '@storybook/react';
import DibelsBreakdownBar from './DibelsBreakdownBar';


storiesOf('components/DibelsBreakdownBar', module) // eslint-disable-line no-undef
  .add('all', () => {
    const style = {
      margin: 20,
      width: 300
    };
    return (
      <div style={{display: 'flex', flexDirection: 'column', margin: 20, background: '3px solid black'}}>
       <DibelsBreakdownBar height={20} labelTop={23} style={style} coreCount={2} strategicCount={3} intensiveCount={7} />
       <DibelsBreakdownBar height={20} labelTop={23} style={style} coreCount={12} strategicCount={13} intensiveCount={17} />
       <DibelsBreakdownBar height={20} labelTop={23} style={style} coreCount={0} strategicCount={0} intensiveCount={0} />
       <DibelsBreakdownBar height={40} labelTop={43} style={style} coreCount={4} strategicCount={8} intensiveCount={2} />
      </div>
    );
  });