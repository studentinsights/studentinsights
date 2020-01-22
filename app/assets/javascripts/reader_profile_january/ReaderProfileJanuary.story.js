import {storiesOf} from '@storybook/react';
import {testRuns, renderTestGrid} from './ReaderProfileJanuary.testSetup';


storiesOf('reader_profile_january/ReaderProfileJanuary', module) // eslint-disable-line no-undef
  .add('all', () => renderTestGrid(testRuns()));