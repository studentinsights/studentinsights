import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import Button from './Button';


storiesOf('components/Button', module) // eslint-disable-line no-undef
  .add('all', () => {
    return<Button onClick={action('click')}>Share</Button>;
  });