import {storiesOf} from '@storybook/react';
import {renderAcrossAllCombinations} from './IepDialogLink.test';

storiesOf('profile/IepDialogLink', module) // eslint-disable-line no-undef
  .add('all combinations', () => renderAcrossAllCombinations());