import React from 'react';
import {storiesOf} from '@storybook/react';
import {withDefaultNowContext} from '../testing/NowContainer';
import IncidentCard from './IncidentCard';
import {testProps} from './IncidentCard.test';

storiesOf('home/IncidentCard', module) // eslint-disable-line no-undef
  .add('all', () => withDefaultNowContext(<IncidentCard {...testProps()} />));
