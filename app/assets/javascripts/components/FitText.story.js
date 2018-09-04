import React from 'react';
import {storiesOf} from '@storybook/react';
import FitText from './FitText';


function storyContainerStyles() {
  return [
    { display: 'flex', width: 80, height: 40, border: '1px solid black' },
    { display: 'flex', width: 200, height: 80, border: '1px solid black' },
    { display: 'flex', width: 300, height: 100, border: '1px solid black' },
    { display: 'flex', width: 420, height: 300, border: '1px solid black'}
  ];
}


storiesOf('components/FitText', module) // eslint-disable-line no-undef
  .add('all', () => {
    return (
      <div style={{display: 'flex', padding: 10}}>
        <div style={{flex: 1, padding: 10}}>
          <code>default</code>
          {storyContainerStyles().map(containerStyle => (
            <div style={{...containerStyle, marginBottom: 20}} key={JSON.stringify(containerStyle)}>
              <FitText text="this resizes the font size to fit, within bounds" />
            </div>
          ))}
        </div>
        <div style={{flex: 1, padding: 10}}>
          <code>minFontSize: 0, maxFontSize:120</code>
          {storyContainerStyles().map(containerStyle => (
            <div style={{...containerStyle, marginBottom: 20}} key={JSON.stringify(containerStyle)}>
              <FitText maxFontSize={120} minFontSize={0} text="this resizes the font size to fit, within bounds" />
            </div>
          ))}
        </div>
      </div>
    );
  });