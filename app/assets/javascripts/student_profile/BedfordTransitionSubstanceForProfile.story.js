import React from 'react';
import {storiesOf} from '@storybook/react';
import BedfordTransitionSubstanceForProfile from './BedfordTransitionSubstanceForProfile';
import {testProps} from './BedfordTransitionSubstanceForProfile.test';

function storyEl(props = {}) {
  return <BedfordTransitionSubstanceForProfile {...props} />;
}

storiesOf('profile/BedfordTransitionSubstanceForProfile', module) // eslint-disable-line no-undef
  .add('all', () => storyEl(testProps()));
