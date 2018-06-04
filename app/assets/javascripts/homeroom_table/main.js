import React from 'react';
import ReactDOM from 'react-dom';
import HomeroomTable from './HomeroomTable';
import MixpanelUtils from '../helpers/MixpanelUtils';

export default function homeroomMain() {
  

  // This adds behavior to code rendered server-side by the Rails view.
  // As a next step we could pull out a parent component named HomeroomPage...
  $('#homeroom-select').bind('change', function() {
    window.location.pathname = '/homerooms/' + $(this).val();
  });

  // track user for mixpanel
  const currentEducator = $('#current-educator-data').data().currentEducator;
  const homeroom = $('#homeroom-data').data().homeroom;
  MixpanelUtils.registerUser(currentEducator);
  MixpanelUtils.track('PAGE_VISIT', {
    page_key: 'ROSTER_PAGE',
    homeroom_id: homeroom.id,
    homeroom_slug: homeroom.slug,
    homeroom_grade: homeroom.grade
  });

  // entry point, reading static bootstrapped data from the page
  const serializedData = $('#serialized-data').data();

  ReactDOM.render(
    <HomeroomTable
      showStar={serializedData.showStar}
      showMcas={serializedData.showMcas}
      rows={serializedData.rows}
      school={serializedData.school}
    />,
    document.getElementById('main')
  );
}
