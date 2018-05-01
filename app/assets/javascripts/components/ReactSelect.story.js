import React from 'react';
import {storiesOf} from '@storybook/react';


storiesOf('components/ReactSelect', module) // eslint-disable-line no-undef
  .add('normal', () => {
    const url = 'http://jedwatson.github.io/react-select/';
    return (
      <div>
        <a href={url} style={{padding: 20, display: 'block'}} target="_blank">{url}</a>
        <iframe src={url} width="100%" height="600" style={{border: 0}}>react-select demos</iframe>;
      </div>
    );
  });