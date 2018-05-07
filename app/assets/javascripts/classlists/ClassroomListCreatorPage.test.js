import React from 'react';
import ReactDOM from 'react-dom';
import {MemoryRouter} from 'react-router-dom';
import mockWithFixtures from './fixtures/mockWithFixtures';
import ClassroomListCreatorPage, {ClassroomListCreatorPageEntryPoint} from './ClassroomListCreatorPage';

beforeEach(() => mockWithFixtures());

it('renders without crashing on entrypoint', () => {
  const el = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter initialEntries={['/balancing']}>
      <ClassroomListCreatorPageEntryPoint disableHistory={true} />
    </MemoryRouter>
  , el);
});

it('renders without crashing with balanceId', () => {
  const el = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter initialEntries={['/balancing/foo-id']}>
      <ClassroomListCreatorPage balanceId="foo-id" disableHistory={true} />
    </MemoryRouter>
  , el);
});
