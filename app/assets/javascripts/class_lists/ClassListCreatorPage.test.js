import React from 'react';
import ReactDOM from 'react-dom';
import {MemoryRouter} from 'react-router-dom';
import mockWithFixtures from './fixtures/mockWithFixtures';
import ClassListCreatorPage from './ClassListCreatorPage';

beforeEach(() => mockWithFixtures());

it('renders without crashing on entrypoint', () => {
  const el = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter initialEntries={['/classlists']}>
      <ClassListCreatorPage disableHistory={true} />
    </MemoryRouter>
  , el);
});

it('renders without crashing with balanceId', () => {
  const el = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter initialEntries={['/classlists/foo-id']}>
      <ClassListCreatorPage defaultWorkspaceId="foo-id" disableHistory={true} />
    </MemoryRouter>
  , el);
});
