import ReactDOM from 'react-dom';
import IncidentCard from '../../../app/assets/javascripts/components/IncidentCard';
import incidentFixture from '../fixtures/incident';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<IncidentCard incident={incidentFixture} />, div);
});
