import {storiesOf} from '@storybook/react';
import {testProps, testEl} from './ReaderProfileJune.test';

storiesOf('reader_profile/ReaderProfileJune', module) // eslint-disable-line no-undef
  .add('all', () => testEl(testProps()));