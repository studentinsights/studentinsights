import React from 'react';
import {MemoryRouter} from 'react-router-dom';
import {storiesOf} from '@storybook/react';
import ClassListCreatorPage from './ClassListCreatorPage';
import mockWithFixtures from './fixtures/mockWithFixtures';
import storybookFrame from './storybookFrame';
import {testProps} from './ClassListCreatorPage.test';

storiesOf('classlists/ClassListCreatorPage', module) // eslint-disable-line no-undef
  .add('normal', () => {
    mockWithFixtures();
    const props = testProps();
    return storybookFrame(
      <MemoryRouter initialEntries={['/classlists']}>
        <ClassListCreatorPage {...props} />
      </MemoryRouter>
    );
  });
