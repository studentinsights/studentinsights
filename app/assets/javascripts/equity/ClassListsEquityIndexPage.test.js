import React from 'react';
import ReactDOM from 'react-dom';
import fetchMock from 'fetch-mock/es5/client';
import renderer from 'react-test-renderer';
import ClassListsEquityIndexPage, {ClassListsEquityIndexView} from './ClassListsEquityIndexPage';
import experimental_workspaces_with_equity_json from './experimental_workspaces_with_equity_json.fixture';

beforeEach(() => {
  fetchMock.reset();
  fetchMock.restore();
  fetchMock.get('express:/api/class_lists/experimental_workspaces_with_equity_json', experimental_workspaces_with_equity_json);
});

export function testProps(props = {}) {
  return {
    currentEducatorId: 999999,
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(<ClassListsEquityIndexPage {...props} />, el);
});


it('snapshots view', () => {
  const json = experimental_workspaces_with_equity_json;
  const props = testProps({
    dimensionKeys: json.dimension_keys,
    classListsWithDimensions: json.class_lists_with_dimensions
  });
  const tree = renderer
    .create(<ClassListsEquityIndexView {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});