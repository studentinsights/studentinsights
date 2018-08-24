import React from 'react';
import ReactDOM from 'react-dom';
import MixpanelUtils from '../helpers/MixpanelUtils';
import PageContainer from './PageContainer';

export default function renderNotesFeedMain(el) {
  const serializedData = $('#serialized-data').data();
  render(el, {
    currentEducator: serializedData.currentEducator,
    educatorsIndex: serializedData.educatorsIndex,
    notes: serializedData.notes,
    totalNotesCount: serializedData.totalNotesCount
  });
}
  
function render(el, json) {
  MixpanelUtils.registerUser(json.currentEducator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'NOTES_FEED' });
  ReactDOM.render(<PageContainer
    currentEducator={json.currentEducator}
    educatorsIndex={json.educatorsIndex}
    eventNotes={json.notes}
    totalNotesCount={json.totalNotesCount} />, el);
}
