import React from 'react';
import ReactDOM from 'react-dom';
import MixpanelUtils from '../helpers/MixpanelUtils';
import {readEnv} from '../helpers/envForJs';
import SchoolOverviewPage from './SchoolOverviewPage';
import {parseFiltersHash} from '../helpers/Filters';
import {apiFetchJson} from '../helpers/apiFetchJson';


// Load data from inline on the page or with another request
export default function renderSchoolOverviewMain(el, options = {}) {
  if (options.json) {
    const {schoolSlug} = $('#serialized-data').data();
    const url = `/schools/${schoolSlug}/overview_json`;
    apiFetchJson(url).then(json => render(el, json));
  } else {
    const serializedData = $('#serialized-data').data();
    const {students, school} = serializedData; // undo outer camelcase
    render(el, {
      students,
      school,
      current_educator: serializedData.currentEducator,
      constant_indexes: serializedData.constantIndexes
    });
  }
}

function render(el, json) {
  MixpanelUtils.registerUser(json.current_educator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'SCHOOL_OVERVIEW_DASHBOARD' });
  const {districtKey} = readEnv();
  ReactDOM.render(<SchoolOverviewPage
    districtKey={districtKey}
    allStudents={json.students}
    school={json.school}
    serviceTypesIndex={json.constant_indexes.service_types_index}
    eventNoteTypesIndex={json.constant_indexes.event_note_types_index}
    initialFilters={parseFiltersHash(window.location.hash)} />, el);
}
