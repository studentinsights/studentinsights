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
       <DibelsBreakdownBar height={20} labelTop={23} style={style} strategicCount={3} coreCount={2} intensiveCount={7} />
       <DibelsBreakdownBar height={20} labelTop={23} style={style} strategicCount={13} coreCount={12} intensiveCount={17} />
       <DibelsBreakdownBar height={20} labelTop={23} style={style} strategicCount={0} coreCount={0} intensiveCount={0} />
       <DibelsBreakdownBar height={40} labelTop={43} style={style} strategicCount={8} coreCount={4} intensiveCount={2} />
      </div>
    );
  });