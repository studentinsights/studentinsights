import React from 'react';
import ReactDOM from 'react-dom';
import {MemoryRouter} from 'react-router-dom';
import mockWithFixtures from './fixtures/mockWithFixtures';
import ClassroomListCreatorPage from './ClassroomListCreatorPage';

beforeEach(() => mockWithFixtures());

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter initialEntries={['/balancing']}>
      <ClassroomListCreatorPage disableHistory={true} />
    </MemoryRouter>
  , el);
});
