import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import mockWithFixtures from './fixtures/mockWithFixtures';
import ClassListsViewPage, {ClassListsViewPageView} from './ClassListsViewPage';
import workspaces_json from './fixtures/workspaces_json';

beforeEach(() => mockWithFixtures());

export function testProps(props = {}) {
  return {
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(<ClassListsViewPage {...props} />, el);
});


it('snapshots view', () => {
  const json = workspaces_json;
  const tree = renderer
    .create(<ClassListsViewPageView {...json} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});