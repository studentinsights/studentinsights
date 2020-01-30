import {storiesOf} from '@storybook/react';
import {testRuns, renderTestGrid} from './ReaderProfileJanuary.testSetup';


storiesOf('reader_profile_january/ReaderProfileJanuary', module) // eslint-disable-line no-undef
  .add('grid', () => renderTestGrid(testRuns()))
  .add('grid-expanded', () => renderTestGrid(testRuns({debugShowAllExpandedViews: true})));