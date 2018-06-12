import React from 'react';
import {storiesOf} from '@storybook/react';
import Bar from './Bar';


storiesOf('components/Bar', module) // eslint-disable-line no-undef
  .add('all', () => {
    const style = {
      backgroundColor: '#ccc',
      marginTop: 20
    };
    const innerStyle = {
      justifyContent: 'flex-start',
      padding: 5
    };
    return (
      <div style={{display: 'flex', flexDirection: 'column', margin: 20, width: 300, border: '1px solid #333'}}>
       <Bar style={style} innerStyle={innerStyle} threshold={5} percent={3} />
       <Bar style={style} innerStyle={innerStyle} threshold={5} percent={5} />
       <Bar style={style} innerStyle={innerStyle} threshold={5} percent={35} />
       <Bar style={style} innerStyle={innerStyle} threshold={5} percent={97} />
       <Bar style={style} innerStyle={innerStyle} threshold={5} percent={72} />
      </div>
    );
  });