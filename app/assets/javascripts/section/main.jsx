import MixpanelUtils from '../helpers/mixpanel_utils.jsx';

$(function() {
  if ($('body').hasClass('sections') && $('body').hasClass('show')) {
    const SectionPage = window.shared.SectionPage;

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