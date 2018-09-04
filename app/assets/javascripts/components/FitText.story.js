import React from 'react';
import {storiesOf} from '@storybook/react';
import FitText from './FitText';


function storyContainerStyles() {
  return [
    { display: 'flex', width: 80, height: 40, border: '1px solid black' },
    { display: 'flex', width: 200, height: 80, border: '1px solid black' },
    { display: 'flex', width: 300, height: 100, border: '1px solid black' },
    { display: 'flex', width: 400, height: 300, border: '1px solid black'}
  ];
}


storiesOf('components/FitText', module) // eslint-disable-line no-undef
  .add('all', () => {
    return (
      <div style={{padding: 20}}>
        {storyContainerStyles().map(containerStyle => (
          <div style={containerStyle} key={JSON.stringify(containerStyle)}>
            <FitText text="when there is too much work and I don't know what to do" />
          </div>
        ))}
      </div>
    );
  });