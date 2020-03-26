import {configure} from '@storybook/react';
import '../sprockets-shims';

/* eslint-disable no-undef */
function loadStories() {
  global.STORYBOOK_IS_RUNNING = 'yes_storybook_is_running';

  mockJestFns();

  // components
  require('../../../app/assets/javascripts/components/Bar.story');
  require('../../../app/assets/javascripts/components/BoxAndWhisker.story');
  require('../../../app/assets/javascripts/components/Button.story');
  require('../../../app/assets/javascripts/components/Circle.story');
  require('../../../app/assets/javascripts/components/DibelsBreakdownBar.story');
  require('../../../app/assets/javascripts/components/FitText.story');
  require('../../../app/assets/javascripts/components/NoteBadge.story');
  require('../../../app/assets/javascripts/components/ReactSelect.story');
  require('../../../app/assets/javascripts/components/ResizingTextArea.story');
  require('../../../app/assets/javascripts/components/Stack.story');

  // home
  require('../../../app/assets/javascripts/home/CheckStudentsWithHighAbsences.story');

  // feed
  require('../../../app/assets/javascripts/feed/IncidentCard.story');
  require('../../../app/assets/javascripts/feed/StudentVoiceCard.story');

  // student profile
  require('../../../app/assets/javascripts/student_profile/BedfordTransitionSubstanceForProfile.story');
  require('../../../app/assets/javascripts/student_profile/DraftNote.story');
  require('../../../app/assets/javascripts/student_profile/IepDialogLink.story');
  require('../../../app/assets/javascripts/student_profile/InsightFromGenericImportedForm.story');
  require('../../../app/assets/javascripts/student_profile/LanguageStatusLink.story');
  require('../../../app/assets/javascripts/student_profile/LightProfilePage.story');
  require('../../../app/assets/javascripts/student_profile/NoteCard.story');
  require('../../../app/assets/javascripts/student_profile/RecordService.story');
  require('../../../app/assets/javascripts/student_profile/ReflectionsAboutGrades.story');
  require('../../../app/assets/javascripts/student_profile/RestrictedNotePresence.story');
  require('../../../app/assets/javascripts/student_profile/StudentSectionsRoster.story');

  // reader profile (june, january)
  require('../../../app/assets/javascripts/reader_profile/ReaderProfileJune.story');
  require('../../../app/assets/javascripts/reader_profile_january/ReaderProfileJanuary.story');
  require('../../../app/assets/javascripts/reader_profile_january/StarReadingTab.story');
  require('../../../app/assets/javascripts/reader_profile_january/StarReadingView.story');
  require('../../../app/assets/javascripts/reader_profile_january/FirstSoundFluencyView.story');
  require('../../../app/assets/javascripts/reader_profile_january/FAndPEnglishView.story');
  require('../../../app/assets/javascripts/reader_profile_january/FAndPMaterials.story');
  require('../../../app/assets/javascripts/reader_profile_january/BenchmarkBoxChart.story');
  require('../../../app/assets/javascripts/reader_profile_january/BenchmarkCohortChart.story');

  //reading (grouping, data entry, debug)
  require('../../../app/assets/javascripts/reading/ChooseTeam.story');
  require('../../../app/assets/javascripts/reading/MakePlan.story');
  require('../../../app/assets/javascripts/reading/CreateGroups.story');
  require('../../../app/assets/javascripts/reading/SidebarDialog.story');
  require('../../../app/assets/javascripts/reading_debug/ReadingThresholdsPage.story');

  // my notes
  require('../../../app/assets/javascripts/my_notes/NotesFeed.story');

  // absences
  require('../../../app/assets/javascripts/school_absences/SchoolAbsencesPage.story');
  
  // classlists
  require('../../../app/assets/javascripts/class_lists/ClassListsViewPage.story');
  require('../../../app/assets/javascripts/class_lists/HorizontalStepper.story');
  require('../../../app/assets/javascripts/class_lists/ClassListCreatorPage.story');
  require('../../../app/assets/javascripts/class_lists/ClassListCreatorWorkflow.story');
  require('../../../app/assets/javascripts/class_lists/CreateYourLists.story');
  require('../../../app/assets/javascripts/class_lists/ClassroomStats.story');
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