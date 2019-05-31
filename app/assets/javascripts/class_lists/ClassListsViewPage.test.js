import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import mockWithFixtures from './fixtures/mockWithFixtures';
import PerDistrictContainer from '../components/PerDistrictContainer';
import ClassListsViewPage, {ClassListsViewPageView} from './ClassListsViewPage';
import workspaces_json from './fixtures/workspaces_json';

beforeEach(() => mockWithFixtures());


export function testProps(props = {}) {
  return {
    currentEducatorId: 999999,
    ...props
  };
}

function withSomervilleContext(el) {
  return <PerDistrictContainer districtKey="somerville">{el}</PerDistrictContainer>;
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(withSomervilleContext(<ClassListsViewPage {...props} />), el);
});


it('snapshots view', () => {
  const props = testProps({...workspaces_json});
  const tree = renderer
    .create(withSomervilleContext(<ClassListsViewPageView {...props} />))
    .toJSON();
  expect(tree).toMatchSnapshot();
});


it('snapshots view with text links', () => {
  const props = testProps({...workspaces_json, useTextLinks: true});
  const tree = renderer
    .create(withSomervilleContext(<ClassListsViewPageView {...props} />))
    .toJSON();
  expect(tree).toMatchSnapshot();
});