import React from 'react';
import {storiesOf} from '@storybook/react';
import {widthFrame} from './storybookFrame';
import mockWithFixtures from './fixtures/mockWithFixtures';
import ClassListsViewPage, {ClassListsViewPageView} from './ClassListsViewPage';
import {testProps} from './ClassListsViewPage.test';


storiesOf('classlists/ClassListsViewPage', module) // eslint-disable-line no-undef
  .add('none yet', () => widthFrame(<ClassListsViewPageView {...testProps({ workspaces: [] })} />))
  .add('normal', () => {
    mockWithFixtures();
    return widthFrame(<ClassListsViewPage {...testProps()} />);
  });
