import {storiesOf} from '@storybook/react';
import {renderAcrossAllCombinations} from './LanguageStatusLink.test';

storiesOf('profile/LanguageStatusLink', module) // eslint-disable-line no-undef
  .add('all combinations', () => renderAcrossAllCombinations());