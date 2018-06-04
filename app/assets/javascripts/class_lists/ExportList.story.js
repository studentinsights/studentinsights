import {storiesOf} from '@storybook/react';
import {testProps, testEl} from './ExportList.test';


storiesOf('classlists/ExportList', module) // eslint-disable-line no-undef
  .add('normal', () => testEl(testProps()));