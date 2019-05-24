import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import storybookFrame from './storybookFrame';
import {withDefaultNowContext} from '../testing/NowContainer';
import ClassroomStats from './ClassroomStats';
import {testProps} from './ClassroomStats.test';


function storyProps(props = {}) {
  return {
    ...testProps(),
    onCategorySelected: action('onCategorySelected'),
    ...props
  };
}

function storyRender(props = {}) {
  return storybookFrame(withDefaultNowContext(<ClassroomStats {...props} />));
}

storiesOf('classlists/ClassroomStats', module) // eslint-disable-line no-undef
  .add('normal', () => (
    <div>
      {storyRender(storyProps())}
      <pre>{JSON.stringify(storyProps())}</pre>
      <pre>{JSON.stringify(storyProps(), null, 2)}</pre>
    </div>
  ));