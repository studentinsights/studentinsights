import MixpanelUtils from '../helpers/mixpanel_utils.jsx';
import SectionPage from './SectionPage'

export default function renderSectionMain(el) {

  const serializedData = $('#serialized-data').data();
  MixpanelUtils.registerUser(serializedData.currentEducator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'SECTION' });

  window.ReactDOM.render(<SectionPage
        students={serializedData.students}
        section={serializedData.section}
        educators={serializedData.educators}
        sections={serializedData.sections}
        currentEducator={serializedData.currentEducator}/>, el);
}
