import renderStudentMain from '../app/assets/javascripts/student_profile/main.jsx';
import renderSchoolOverviewMain from '../app/assets/javascripts/school_overview/main.jsx';
import homeroomMain from '../app/assets/javascripts/homeroom_table/main.jsx';
import renderRestrictedNotesMain from '../app/assets/javascripts/restricted_notes/main.jsx';
import renderSectionMain from '../app/assets/javascripts/section/main.jsx';
import renderServiceUploadsMain from '../app/assets/javascripts/service_uploads/main.jsx';
import renderSchoolAdminDashboardMain from '../app/assets/javascripts/school_administrator_dashboard/main.jsx';


// Placeholder routing (not fully client-side, just on page load).
// Clicking links still reloads the whole page from the server.
export default function route() {
  const el = document.getElementById('main');
  if ($('body').hasClass('students') && $('body').hasClass('show')) {
    renderStudentMain(el);
  }

  if ($('body').hasClass('schools') && $('body').hasClass('show')) {
    renderSchoolOverviewMain(el);
  }

  if ($('body').hasClass('homerooms') && $('body').hasClass('show')) {
    homeroomMain(); // different HTML
  }

  if ($('body').hasClass('students') && $('body').hasClass('restricted_notes')) {
    renderRestrictedNotesMain(el);
  }

  if ($('body').hasClass('sections') && $('body').hasClass('show')) {
    renderSectionMain(el);
  }

  if ($('body').hasClass('service_uploads') && $('body').hasClass('index')) {
    renderServiceUploadsMain(el);
  }

  if ($('body').hasClass('schools') && $('body').hasClass('school_administrator_dashboard')) {
    renderSchoolAdminDashboardMain(el);
  }
}
