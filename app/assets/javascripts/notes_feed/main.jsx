import MixpanelUtils from '../helpers/mixpanel_utils.jsx';
import PageContainer from './PageContainer.js';

export default function renderNotesFeedMain(el) {
  const serializedData = $('#serialized-data').data();
  render(el, {
    current_educator: serializedData.currentEducator,
    educatorsIndex: serializedData.educatorsIndex,
    eventNoteTypesIndex: serializedData.eventNoteTypesIndex,
    notes: serializedData.notes,
  });
}
  
function render(el, json) {
  MixpanelUtils.registerUser(json.current_educator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'NOTES_FEED' });
  window.ReactDOM.render(<PageContainer
    educatorsIndex={json.educatorsIndex}
    eventNotes={json.notes}
    eventNoteTypesIndex={json.eventNoteTypesIndex} />, el);
}
