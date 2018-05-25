import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import Button, {SeriousButton} from './Button';


storiesOf('components/Button', module) // eslint-disable-line no-undef
  .add('normal', () => {
    return<Button onClick={action('click')}>Share</Button>;
  })
  .add('SeriousButton', () => {
    return<SeriousButton onClick={action('click')}>Delete</SeriousButton>;
  });