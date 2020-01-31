import React from 'react';
import {storiesOf} from '@storybook/react';
import ReadingThresholdsPage from './ReadingThresholdsPage';


storiesOf('reading_debug/ReadingThresholdsPage', module) // eslint-disable-line no-undef
  .add('default', () => <ReadingThresholdsPage />);