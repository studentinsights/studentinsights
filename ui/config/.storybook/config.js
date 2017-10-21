import { configure } from '@storybook/react';
import '../sprockets-shims.js';
import '../../legacy.js';

/* eslint-disable no-undef */
function loadStories() {
  require('../../../app/assets/javascripts/components/flexible_roster.story.js');
  require('../../../app/assets/javascripts/student_profile/student_sections_roster.story.js');
  require('../../../app/assets/javascripts/student_profile/risk_bubble.story.js');
  // add more here!
}
configure(loadStories, module);
/* eslint-enable no-undef */