import React from 'react';
import ReactDOM from 'react-dom';
import RestrictedNotesPageContainer from './RestrictedNotesPageContainer';

export default function restrictedNotesMain(el) {
  const serializedData = $('#serialized-data').data();
  ReactDOM.render(<RestrictedNotesPageContainer serializedData={serializedData} nowMomentFn={moment.utc} />, el);
}
