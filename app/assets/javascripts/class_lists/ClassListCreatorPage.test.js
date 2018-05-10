import React from 'react';
import ReactDOM from 'react-dom';
import {MemoryRouter} from 'react-router-dom';
import mockWithFixtures from './fixtures/mockWithFixtures';
import ClassListCreatorPage from './ClassListCreatorPage';

beforeEach(() => mockWithFixtures());

function testProps(props) {
  return {
    disableHistory: true,
    disableSizing: true,
    ...props
  };
}

it('renders without crashing on entrypoint', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter initialEntries={['/classlists']}>
      <ClassListCreatorPage {...props} />
    </MemoryRouter>
  , el);
});

it('renders without crashing with balanceId', () => {
  const props = testProps({defaultWorkspaceId: 'foo-id'});
  const el = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter initialEntries={['/classlists/foo-id']}>
      <ClassListCreatorPage {...props} />
    </MemoryRouter>
  , el);
});
