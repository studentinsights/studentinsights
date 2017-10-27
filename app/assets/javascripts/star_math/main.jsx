import MixpanelUtils from '../helpers/mixpanel_utils.jsx';

export default function renderStarMath(el) {
  const StarChartsPage = window.shared.StarChartsPage;
  const Filters = window.shared.Filters;

  const serializedData = $('#serialized-data').data();
  MixpanelUtils.registerUser(serializedData.currentEducator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'STAR_MATH_PAGE' });

  window.ReactDOM.render(<StarChartsPage
    students={serializedData.studentsWithStarResults}
    dateNow={new Date()}
    serviceTypesIndex={serializedData.constantIndexes.service_types_index}
    eventNoteTypesIndex={serializedData.constantIndexes.event_note_types_index}
    initialFilters={Filters.parseFiltersHash(window.location.hash)}
    history={window.history} />, el);
}
