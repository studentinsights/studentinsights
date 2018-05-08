import React from 'react';
import {MemoryRouter} from 'react-router-dom';
import {storiesOf} from '@storybook/react';
import ClassListCreatorPage from './ClassListCreatorPage';
import mockWithFixtures from './fixtures/mockWithFixtures';
import storybookFrame from './storybookFrame';

storiesOf('equity/ClassListCreatorPage', module) // eslint-disable-line no-undef
  .add('normal', () => {
    mockWithFixtures();
    return storybookFrame(
      <MemoryRouter initialEntries={['/classlists']}>
        <ClassListCreatorPage disableHistory={true} />
      </MemoryRouter>
    );
  });
