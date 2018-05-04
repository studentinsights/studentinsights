import {configure} from '@storybook/react';
import '../sprockets-shims.js';
import '../../legacy.js';

/* eslint-disable no-undef */
function loadStories() {
  mockJestFns();

  // components
  require('../../../app/assets/javascripts/components/Bar.story.js');
  require('../../../app/assets/javascripts/components/BoxAndWhisker.story.js');
  require('../../../app/assets/javascripts/components/Button.story.js');
  require('../../../app/assets/javascripts/components/Circle.story.js');
  require('../../../app/assets/javascripts/components/DibelsBreakdownBar.story.js');
  require('../../../app/assets/javascripts/components/ReactSelect.story.js');
  require('../../../app/assets/javascripts/components/Stack.story.js');

  // home
  require('../../../app/assets/javascripts/home/CheckStudentsWithHighAbsences.story.js');

  // student profile
  require('../../../app/assets/javascripts/student_profile/RiskBubble.story.js');
  
  // equity
  require('../../../app/assets/javascripts/equity/ClassroomListCreatorPage.story.js');
  require('../../../app/assets/javascripts/equity/ClassroomListCreatorWorkflow.story.js');
  require('../../../app/assets/javascripts/equity/CreateYourClassroomsView.story.js');
  require('../../../app/assets/javascripts/equity/InlineStudentProfile.story.js');
  require('../../../app/assets/javascripts/equity/HorizontalStepper.story.js');

  // add more here!
}
configure(loadStories, module);
/* eslint-enable no-undef */

// This is enabling sharing setup functions between tests and stories.
// It mocks out Jest functions, so that from a .story.js file, we can
// import a function from a .test.js file.  The way tests are written, this
// import will execute the various blocks of Jest code, and so this prevents that.
function mockJestFns() {
  global.describe = function() {}
  global.beforeEach = function() {}
  global.it = function() {}
  global.jest = {
    fn() {}
  };
}