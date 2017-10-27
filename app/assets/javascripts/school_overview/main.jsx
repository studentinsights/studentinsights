import MixpanelUtils from '../helpers/mixpanel_utils.jsx';
import fetchGraphQL from './fetchGraphQL.js';
import schoolOverviewQuery from 'raw-loader!./schoolOverviewQuery.graphql';

export default function renderSchoolOverviewMain(el) {
  const SchoolOverviewPage = window.shared.SchoolOverviewPage;
  const Filters = window.shared.Filters;
  
  // const serializedData = $('#serialized-data').data();
  const variables = { schoolId: 2 }; // from URL, in this case
  fetchGraphQL(schoolOverviewQuery, variables).then(response => {
    const {data} = response;
    const {
      currentEducator,
      school,
      serviceTypes,
      eventNoteTypes
    } = data;

    // Index (seems GraphQL doesn't support a plain map type https://github.com/facebook/graphql/issues/101)
    const eventNoteTypesIndex = eventNoteTypes.reduce((map, pair) => {
      return {...map, [pair.id]: pair};
    });
    const serviceTypesIndex = serviceTypes.reduce((map, pair) => {
      return {...map, [pair.id]: pair};
    });

    // Track and render
    MixpanelUtils.registerUser(currentEducator);
    MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_OVERVIEW_DASHBOARD' });
    window.ReactDOM.render(<SchoolOverviewPage
      allStudents={school.students}
      school={school}
      serviceTypesIndex={serviceTypesIndex}
      eventNoteTypesIndex={eventNoteTypesIndex}
      initialFilters={Filters.parseFiltersHash(window.location.hash)} />, el);
  });
}
