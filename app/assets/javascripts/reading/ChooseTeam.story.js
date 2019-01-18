import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import ChooseTeam from './ChooseTeam';
import {testProps} from './ChooseTeam.test';

function storyProps(props = {}) {
  return {
    ...testProps(),
    onTeamChanged: action('onTeamChanged'),
    onDone: action('onDone'),
    ...props
  };
}

storiesOf('reading/ChooseTeam', module) // eslint-disable-line no-undef
  .add('normal', () => <ChooseTeam {...storyProps()} />);