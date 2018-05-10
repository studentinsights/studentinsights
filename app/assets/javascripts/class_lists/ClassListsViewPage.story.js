import React from 'react';
import {storiesOf} from '@storybook/react';
import mockWithFixtures from './fixtures/mockWithFixtures';
import ClassListsViewPage from './ClassListsViewPage';
import {testProps} from './ClassListsViewPage.test';

function testRender(props = {}) {
  return <ClassListsViewPage {...props} />;
}

storiesOf('classlists/ClassListsViewPage', module) // eslint-disable-line no-undef
  .add("normal", () => {
    mockWithFixtures();
    return testRender(testProps({}));
  });
