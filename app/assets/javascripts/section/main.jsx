import Roster from '../components/roster.jsx';
import SectionHeader from './section_header.jsx';

$(function() {
  if ($('body').hasClass('sections') && $('body').hasClass('show')) {
    const MixpanelUtils = window.shared.MixpanelUtils;
    const SectionPage = window.shared.SectionPage;
    const Routes = window.shared.Routes;

    const serializedData = $('#serialized-data').data();
    MixpanelUtils.registerUser(serializedData.currentEducator);
    MixpanelUtils.track('PAGE_VISIT', { page_key: 'SECTION' });

    window.ReactDOM.render(<SectionPage 
          students={serializedData.students}
          section={serializedData.section}
          educators={serializedData.educators}
          sections={serializedData.sections}/>, document.getElementById('main'));
  }
});