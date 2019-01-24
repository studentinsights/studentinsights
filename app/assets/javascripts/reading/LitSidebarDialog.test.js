import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import LitSidebarDialog from './LitSidebarDialog';
import sidebarProps from './sidebarProps.fixture';


export function testProps(props) {
  return {
    onClose: jest.fn(),
    ...sidebarProps,
    ...props
  };
}

export function testEl(props) {
  return withNowContext('2019-01-16T11:03:06.123Z',
    <PerDistrictContainer districtKey="somerville">
      <LitSidebarDialog {...props} />
    </PerDistrictContainer>
  );
}


it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(testEl(props), el);
});

it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(testEl(props))
    .toJSON();
  expect(tree).toMatchSnapshot();
});
