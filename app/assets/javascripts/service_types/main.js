import React from 'react';
import ReactDOM from 'react-dom';
import IsServiceWorking from '../service_types/IsServiceWorking.js';

export default function renderIsServiceWorking() {
  const serializedData = $('#serialized-data').data();

  ReactDOM.render(
    <IsServiceWorking
      serializedData={serializedData}
    />,
    document.getElementById('main')
  );
}
