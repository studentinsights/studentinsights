import ReactDOM from 'react-dom';
import IncidentCard from './IncidentCard';
import incidentCardFixture from './IncidentCard.fixture';


it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<IncidentCard incident={incidentCardFixture} />, el);
});
