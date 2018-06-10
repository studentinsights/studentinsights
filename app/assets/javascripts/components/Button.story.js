import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import Button, {SeriousButton} from './Button';


storiesOf('components/Button', module) // eslint-disable-line no-undef
  .add('all', () => {
    return (
      <div>
        <Button onClick={action('click')}>Share</Button>
        <Button isDisabled={true} onClick={action('click')}>Open</Button>
        <SeriousButton onClick={action('click')}>Delete</SeriousButton>
      </div>
    );
  });