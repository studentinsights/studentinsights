import React from 'react';
import ReactDOM from 'react-dom';
import AttendanceDetails from './AttendanceDetails';

describe('all empty data', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');

    const feed = {
      event_notes: [],
      services: {
        active: [],
        discontinued: []
      },
      deprecated: {
        interventions: []
      }
    };

    ReactDOM.render(
      <AttendanceDetails
        feed={feed}
        absences={[]}
        tardies={[]}
        disciplineIncidents={[]}
        student={{}}
        serviceTypesIndex={{}}
      />, div);
  });
});
