import React from 'react';
import {storiesOf} from '@storybook/react';
import ExportList from './ExportList';
import {testProps} from './ExportList.test';


storiesOf('classlists/ExportList', module) // eslint-disable-line no-undef
  .add('normal', () => {
    const props = testProps();
    return <ExportList {...props} />;
  });