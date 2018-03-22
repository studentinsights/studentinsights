// legacy, what's left to modulify!

// vendor (remove globals in eslintrc as these are removed)
import './legacyVendor';

// app helpers, last to be removed
import './legacyHelpers';

// student profile page:
  // pure ui components:
import '../app/assets/javascripts/student_profile/quad_converter.jsx';
import '../app/assets/javascripts/student_profile/provided_by_educator_dropdown.jsx';
import '../app/assets/javascripts/student_profile/profile_chart_settings.jsx';
import '../app/assets/javascripts/student_profile/bar_chart_sparkline.jsx';
import '../app/assets/javascripts/student_profile/sparkline.jsx';
import '../app/assets/javascripts/student_profile/academic_summary.jsx';
import '../app/assets/javascripts/student_profile/take_notes.jsx';
import '../app/assets/javascripts/student_profile/note_card.jsx';
import '../app/assets/javascripts/student_profile/notes_list.jsx';
import '../app/assets/javascripts/student_profile/services_list.jsx';
import '../app/assets/javascripts/student_profile/record_service.jsx';
import '../app/assets/javascripts/student_profile/profile_chart.jsx';
import '../app/assets/javascripts/student_profile/student_profile_header.jsx';
import '../app/assets/javascripts/student_profile/student_sections_roster.jsx';
import '../app/assets/javascripts/student_profile/pdf/student_profile_pdf.js';

  // details:
import '../app/assets/javascripts/student_profile/services_details.jsx';
import '../app/assets/javascripts/student_profile/profile_details.jsx';

  // page:
import '../app/assets/javascripts/student_profile/student_profile_page.jsx';
  // (unordered)
import '../app/assets/javascripts/student_profile/page_container.jsx';

