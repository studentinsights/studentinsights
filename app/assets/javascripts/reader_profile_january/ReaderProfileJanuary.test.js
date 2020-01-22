import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
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

it('snapshots views across all testRuns', () => {
  const tree = renderer
    .create(renderTestGrid(testRuns()))
    .toJSON();
  expect(tree).toMatchSnapshot();
});