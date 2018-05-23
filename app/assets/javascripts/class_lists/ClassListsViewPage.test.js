import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../../../../spec/javascripts/support/NowContainer';
import mockWithFixtures from './fixtures/mockWithFixtures';
import ClassListsViewPage, {ClassListsViewPageView} from './ClassListsViewPage';
import workspaces_json from './fixtures/workspaces_json';

beforeEach(() => mockWithFixtures());

export function testProps(props = {}) {
  return {
    currentEducatorId: 999999,
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(withDefaultNowContext(<ClassListsViewPage {...props} />), el);
});


it('snapshots view', () => {
  const props = testProps({...workspaces_json});
  const tree = renderer
    .create(withDefaultNowContext(<ClassListsViewPageView {...props} />))
    .toJSON();
  expect(tree).toMatchSnapshot();
});