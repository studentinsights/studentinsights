import React from 'react';
import PropTypes from 'prop-types';
import DetailsSection from './DetailsSection';
import ProfileBarChart, {servicePhaselines} from './ProfileBarChart';
import IncidentCard from '../components/IncidentCard';


export default class LightBehaviorDetails extends React.Component {
  render() {
    return (
      <div className="LightBehaviorDetails">
        {this.renderDisciplineIncidents()}
        {this.renderIncidentHistory()}
      </div>
    );
  }

  renderDisciplineIncidents() {
    const {disciplineIncidents, activeServices, serviceTypesIndex} = this.props;
    const phaselines = servicePhaselines(activeServices, serviceTypesIndex);
    return (
      <ProfileBarChart
        events={disciplineIncidents}
        titleText="Discipline Incidents"
        id="disciplineChart"
        monthsBack={48}
        phaselines={phaselines} />
    );
  }

  renderIncidentHistory() {
    const {disciplineIncidents} = this.props;
    return (
      <DetailsSection anchorId="history" title="Incident History">
        <div style={{paddingTop: 20}}>{disciplineIncidents.length > 0
          ? this.renderIncidents(disciplineIncidents)
          : <div>No Incidents</div>
        }</div>
      </DetailsSection>
    );
  }

  renderIncidents(disciplineIncidents) {
    return (
      <div>
        {disciplineIncidents.map(incident => {
          return <IncidentCard key={incident.id} incident={incident} />;
        })}
      </div>
    );
  }
}

LightBehaviorDetails.propTypes = {
  disciplineIncidents: PropTypes.array.isRequired,
  activeServices: PropTypes.arrayOf(PropTypes.shape({
    service_type_id: PropTypes.number.isRequired,
    date_started: PropTypes.string.isRequired
  })).isRequired,
  serviceTypesIndex: PropTypes.object.isRequired
};
