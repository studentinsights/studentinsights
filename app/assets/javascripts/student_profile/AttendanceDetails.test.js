import ReactDOM from 'react-dom';
import AttendanceDetails from '../../../app/assets/javascripts/student_profile/AttendanceDetails';

describe('all empty data', function () {
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
