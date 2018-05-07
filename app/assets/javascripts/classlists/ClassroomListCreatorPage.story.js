import React from 'react';
import {MemoryRouter} from 'react-router-dom';
import {storiesOf} from '@storybook/react';
import {ClassroomListCreatorPageEntryPoint} from './ClassroomListCreatorPage';
import mockWithFixtures from './fixtures/mockWithFixtures';
import storybookFrame from './storybookFrame';

storiesOf('equity/ClassroomListCreatorPage', module) // eslint-disable-line no-undef
  .add('normal', () => {
    mockWithFixtures();
    return storybookFrame(
      <MemoryRouter initialEntries={['/classlists']}>
        <ClassroomListCreatorPageEntryPoint disableHistory={true} />
      </MemoryRouter>
    );
  });
