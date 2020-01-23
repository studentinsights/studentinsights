import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import ReactTestUtils from 'react-dom/test-utils';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import ExpandedLayout from './ExpandedLayout';

function testProps(props = {}) {
  return {
    titleText: 'First sound fluency',
    studentFirstName: 'Leo',
    onClose: jest.fn(),
    materialsEl: <div>materials!</div>,
    strategiesEl: <div>strategies!</div>,
    dataEl: <div>data!</div>
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(
    <PerDistrictContainer districtKey="somerville">
      <ExpandedLayout {...testProps()} />
    </PerDistrictContainer>
  ), el);
});


it('snapshots view', () => {
  const tree = renderer
    .create(
      <PerDistrictContainer districtKey="somerville">
        <ExpandedLayout {...testProps()} />
      </PerDistrictContainer>
    ).toJSON();
  expect(tree).toMatchSnapshot();
});