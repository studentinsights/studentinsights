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
  require('../../../app/assets/javascripts/student_profile/TakeNotes.story.js');
  
  // classlists
  require('../../../app/assets/javascripts/class_lists/ClassListsViewPage.story.js');
  require('../../../app/assets/javascripts/class_lists/HorizontalStepper.story.js');
  require('../../../app/assets/javascripts/class_lists/ClassListCreatorPage.story.js');
  require('../../../app/assets/javascripts/class_lists/ClassListCreatorWorkflow.story.js');
  require('../../../app/assets/javascripts/class_lists/CreateYourLists.story.js');
  require('../../../app/assets/javascripts/class_lists/StudentCard.story.js');
  require('../../../app/assets/javascripts/class_lists/InlineStudentProfile.story.js');
  require('../../../app/assets/javascripts/class_lists/ExportList.story.js');

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