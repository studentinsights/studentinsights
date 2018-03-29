import MixpanelUtils from '../helpers/mixpanel_utils.jsx';
import {parseFiltersHash} from '../helpers/Filters';
import {apiFetchJson} from '../helpers/apiFetchJson';
import CrazyPage from './CrazyPage';


// Load data from inline on the page or with another request
export default function renderSchoolOverviewMain(el, options = {}) {
  const MixpanelUtils = window.shared.MixpanelUtils;
  const SchoolOverviewPage = window.shared.SchoolOverviewPage;
  const Filters = window.shared.Filters;

  // Analytics 
  const serializedData = $('#serialized-data').data();
  // MixpanelUtils.registerUser(serializedData.currentEducator);
  // MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_OVERVIEW_DASHBOARD' });

  // Render
  ReactDOM.render(<CrazyPage
    allStudents={serializedData.students}
    serviceTypesIndex={serializedData.constantIndexes.service_types_index}
    eventNoteTypesIndex={serializedData.constantIndexes.event_note_types_index}
    initialFilters={parseFiltersHash(window.location.hash)} />, document.getElementById('main'));
}
// =======

// // Load data from inline on the page or with another request
// export default function renderSchoolOverviewMain(el, options = {}) {
//   if (options.json) {
//     const {schoolSlug} = $('#serialized-data').data();
//     const url = `/schools/${schoolSlug}/overview_json`;
//     apiFetchJson(url).then(json => render(el, json));
//   } else {
//     const serializedData = $('#serialized-data').data();
//     const {students, school} = serializedData; // undo outer camelcase
//     render(el, {
//       students,
//       school,
//       current_educator: serializedData.currentEducator,
//       constant_indexes: serializedData.constantIndexes
//     });
// >>>>>>> origin/master
//   }
// }

// function render(el, json) {
//   MixpanelUtils.registerUser(json.current_educator);
//   MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_OVERVIEW_DASHBOARD' });
//   const {districtKey} = window.shared.Env;
//   window.ReactDOM.render(<SchoolOverviewPage
//     districtKey={districtKey}
//     allStudents={json.students}
//     school={json.school}
//     serviceTypesIndex={json.constant_indexes.service_types_index}
//     eventNoteTypesIndex={json.constant_indexes.event_note_types_index}
//     initialFilters={parseFiltersHash(window.location.hash)} />, el);
// }
