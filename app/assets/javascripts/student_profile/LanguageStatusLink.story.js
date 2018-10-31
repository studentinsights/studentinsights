import {storiesOf} from '@storybook/react';
import {renderAcrossAllCombinations} from './LanguageStatusLink.test';

storiesOf('profile-v3/LanguageStatusLink', module) // eslint-disable-line no-undef
  .add('all combinations', () => renderAcrossAllCombinations());