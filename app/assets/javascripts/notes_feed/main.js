import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import NowContainer from '../testing/NowContainer';
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
  ReactDOM.render(
    <NowContainer nowFn={() => moment.utc()}>
      <PageContainer
        currentEducator={json.currentEducator}
        educatorsIndex={json.educatorsIndex}
        eventNotes={json.notes}
        totalNotesCount={json.totalNotesCount}
      />
    </NowContainer>
  , el);
}
