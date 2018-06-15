import {configure} from '@storybook/react';
import '../sprockets-shims';

/* eslint-disable no-undef */
function loadStories() {
  mockJestFns();

  // components
  require('../../../app/assets/javascripts/components/Bar.story');
  require('../../../app/assets/javascripts/components/BoxAndWhisker.story');
  require('../../../app/assets/javascripts/components/Button.story');
  require('../../../app/assets/javascripts/components/Circle.story');
  require('../../../app/assets/javascripts/components/DibelsBreakdownBar.story');
  require('../../../app/assets/javascripts/components/ReactSelect.story');
  require('../../../app/assets/javascripts/components/Stack.story');

  // home
  require('../../../app/assets/javascripts/home/CheckStudentsWithHighAbsences.story');

  // student profile
  require('../../../app/assets/javascripts/student_profile/RiskBubble.story');
  require('../../../app/assets/javascripts/student_profile/TakeNotes.story');
  require('../../../app/assets/javascripts/student_profile/RecordService.story');
  require('../../../app/assets/javascripts/student_profile/StudentProfilePage.story');
  
  // classlists
  require('../../../app/assets/javascripts/class_lists/ClassListsViewPage.story');
  require('../../../app/assets/javascripts/class_lists/HorizontalStepper.story');
  require('../../../app/assets/javascripts/class_lists/ClassListCreatorPage.story');
  require('../../../app/assets/javascripts/class_lists/ClassListCreatorWorkflow.story');
  require('../../../app/assets/javascripts/class_lists/CreateYourLists.story');
  require('../../../app/assets/javascripts/class_lists/StudentCard.story');
  require('../../../app/assets/javascripts/class_lists/InlineStudentProfile.story');
  require('../../../app/assets/javascripts/class_lists/ExportList.story');

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