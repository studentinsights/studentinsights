import {configure} from '@storybook/react';
import '../sprockets-shims.js';
import '../../legacy.js';

/* eslint-disable no-undef */
function loadStories() {
  require('../../../app/assets/javascripts/student_profile/RiskBubble.story.js');
  require('../../../app/assets/javascripts/components/BoxAndWhisker.story.js');
  // add more here!
}
configure(loadStories, module);
/* eslint-enable no-undef */