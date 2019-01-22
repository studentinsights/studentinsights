import {storiesOf} from '@storybook/react';
import {testProps, testEl} from './CreateGroups.test';


storiesOf('reading/CreateGroups', module) // eslint-disable-line no-undef
  .add('mock photo', () => testEl(testProps()))
  .add('fallback photo', () => testEl(testProps({useMockPhoto: true})));
  