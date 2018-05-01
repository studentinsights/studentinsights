import {configure} from '@storybook/react';
import '../sprockets-shims.js';
import '../../legacy.js';

/* eslint-disable no-undef */
function loadStories() {
  // components
  require('../../../app/assets/javascripts/components/Bar.story.js');
  require('../../../app/assets/javascripts/components/BoxAndWhisker.story.js');
  require('../../../app/assets/javascripts/components/Button.story.js');
  require('../../../app/assets/javascripts/components/Circle.story.js');
  require('../../../app/assets/javascripts/components/DibelsBreakdownBar.story.js');
  require('../../../app/assets/javascripts/components/ReactSelect.story.js');

  // student profile
  require('../../../app/assets/javascripts/student_profile/RiskBubble.story.js');
  
  // equity
  require('../../../app/assets/javascripts/equity/ClassroomListCreatorPage.story.js');
  require('../../../app/assets/javascripts/equity/ClassroomListCreatorWorkflow.story.js');
  require('../../../app/assets/javascripts/equity/CreateYourClassroomsView.story.js');
  require('../../../app/assets/javascripts/equity/HorizontalStepper.story.js');

  // add more here!
}
configure(loadStories, module);
/* eslint-enable no-undef */