import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import ReactTestUtils from 'react-dom/test-utils';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import ReaderProfileJanuary from './ReaderProfileJanuary';
import {testProps, testRuns, renderTestGrid} from './ReaderProfileJanuary.testSetup';


it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(
    <PerDistrictContainer districtKey="somerville">
      <ReaderProfileJanuary {...testProps()} />
    </PerDistrictContainer>
  ), el);
});

it('can expand view', () => {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(
    <PerDistrictContainer districtKey="somerville">
      <ReaderProfileJanuary {...testProps()} />
    </PerDistrictContainer>
  ), el);
  ReactTestUtils.Simulate.click($(el).find('.Tab:eq(2)').get(0));
  const expandedText = el.querySelector('.ExpandedLayout').textContent;
  expect(expandedText).toContain('First sound fluency');
  expect(expandedText).toContain('Instructional strategies');
  expect(expandedText).toContain('Data for Mari');
});

it('snapshots views across all testRuns', () => {
  const tree = renderer
    .create(renderTestGrid(testRuns()))
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('snapshots across all testRuns, even when all views are expanded', () => {
  const tree = renderer
    .create(renderTestGrid(testRuns({debugShowAllExpandedViews: true})))
    .toJSON();
  expect(tree).toMatchSnapshot();
});