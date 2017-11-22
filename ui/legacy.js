// legacy, what's left to modulify!

// vendor (remove globals in eslintrc as these are removed)
import './legacyVendor';

// app helpers, last to be removed
import './legacyHelpers';

// student profile page:
  // pure ui components:
import '../app/assets/javascripts/student_profile/help_bubble.jsx';
import '../app/assets/javascripts/student_profile/quad_converter.jsx';
import '../app/assets/javascripts/student_profile/risk_bubble.jsx';
import '../app/assets/javascripts/student_profile/service_color.jsx';
import '../app/assets/javascripts/student_profile/provided_by_educator_dropdown.jsx';
import '../app/assets/javascripts/student_profile/profile_chart_settings.jsx';
import '../app/assets/javascripts/student_profile/educator.jsx';
import '../app/assets/javascripts/student_profile/datepicker.jsx';
import '../app/assets/javascripts/student_profile/highcharts_wrapper.jsx';
import '../app/assets/javascripts/student_profile/bar_chart_sparkline.jsx';
import '../app/assets/javascripts/student_profile/sparkline.jsx';
import '../app/assets/javascripts/student_profile/scales.jsx';
import '../app/assets/javascripts/student_profile/academic_summary.jsx';
import '../app/assets/javascripts/student_profile/take_notes.jsx';
import '../app/assets/javascripts/student_profile/editable_text_component.jsx';
import '../app/assets/javascripts/student_profile/note_card.jsx';
import '../app/assets/javascripts/student_profile/notes_list.jsx';
import '../app/assets/javascripts/student_profile/services_list.jsx';
import '../app/assets/javascripts/student_profile/record_service.jsx';
import '../app/assets/javascripts/student_profile/summary_list.jsx';
import '../app/assets/javascripts/student_profile/profile_chart.jsx';
import '../app/assets/javascripts/student_profile/profile_bar_chart.jsx';
import '../app/assets/javascripts/student_profile/modal_small_icon.jsx';
import '../app/assets/javascripts/student_profile/student_profile_header.jsx';
import '../app/assets/javascripts/student_profile/student_sections_roster.jsx';
import '../app/assets/javascripts/student_profile/pdf/student_profile_pdf.js';

  // details:
import '../app/assets/javascripts/student_profile/services_details.jsx';
import '../app/assets/javascripts/student_profile/notes_details.jsx';
import '../app/assets/javascripts/student_profile/profile_details.jsx';
import '../app/assets/javascripts/student_profile/attendance_details.jsx';
import '../app/assets/javascripts/student_profile/ela_details.jsx';
import '../app/assets/javascripts/student_profile/math_details.jsx';

  // page:
import '../app/assets/javascripts/student_profile/student_profile_page.jsx';
  // (unordered)
import '../app/assets/javascripts/student_profile/api.jsx';
import '../app/assets/javascripts/student_profile/page_container.jsx';
import '../app/assets/javascripts/student_profile/parse_query_string.jsx';

  // restricted notes
import '../app/assets/javascripts/restricted_notes/restricted_notes_page_container.jsx';


// bulk services:
import '../app/assets/javascripts/service_uploads/service_type_dropdown.jsx';


// school overview:
import '../app/assets/javascripts/school_overview/school_overview_page.jsx';


// all the rest, unordered
import '../app/assets/javascripts/homeroom_table/HomeroomTable.js';
import '../app/assets/javascripts/restricted_notes/restricted_notes_page_container.jsx';
import '../app/assets/javascripts/section/SectionHeader.js';
import '../app/assets/javascripts/section/SectionPage.js';
import '../app/assets/javascripts/service_uploads/NewServiceUpload.js';
import '../app/assets/javascripts/service_uploads/service_upload_detail.jsx';
import '../app/assets/javascripts/service_uploads/service_uploads_page.jsx';

