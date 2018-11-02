import React from 'react';
import PropTypes from 'prop-types';
import {toMomentFromTimestamp, toMomentFromRailsDate} from '../helpers/toMoment';
import {toSchoolYear, firstDayOfSchool} from '../helpers/schoolYear';
import IncidentCard from '../feed/IncidentCard';
import DetailsSection from './DetailsSection';
import ProfileBarChart, {servicePhaselines} from './ProfileBarChart';
import CleanSlateMessage from './CleanSlateMessage';


export default class LightBehaviorDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isViewingFullHistory: false,
      schoolYearsBack: {
        number: 1,
        textYears: 'one year'
      }
    };
    this.onToggleCaseHistory = this.onToggleCaseHistory.bind(this);
  }

  filterCutoffMoment() {
    const {nowFn} = this.context;
    const {schoolYearsBack} = this.state;
    const nowMoment = nowFn();
    const pastSchoolYear = toSchoolYear(nowMoment) - schoolYearsBack.number;
    return firstDayOfSchool(pastSchoolYear);
  }

  filteredIncidents() {
    const {isViewingFullHistory} = this.state;
    const {disciplineIncidents} = this.props;
    if (isViewingFullHistory) return disciplineIncidents;

    const cutoffMoment = this.filterCutoffMoment();
    return disciplineIncidents.filter(incident => {
      const incidentMoment = toMomentFromTimestamp(incident.occurred_at);
      return incidentMoment.isAfter(cutoffMoment);
    });
  }

  filteredDataPhaselines() {
    const {isViewingFullHistory, schoolYearsBack} = this.state;
    if (isViewingFullHistory) return [];

    const momentUTC = this.filterCutoffMoment();
    const text = `Only ${schoolYearsBack.textYears} of data is shown to respect privacy`;
    return [{momentUTC, text}];
  }

  servicePhaselines() {
    const {activeServices, serviceTypesIndex} = this.props;
    const cutoffMoment = this.filterCutoffMoment();
    const filteredPhaselines = activeServices.filter(service => {
      const phaselineMoment = toMomentFromRailsDate(service.date_started);
      return phaselineMoment.isAfter(cutoffMoment);
    });
    return servicePhaselines(filteredPhaselines, serviceTypesIndex);
  }

  onToggleCaseHistory() {
    const {isViewingFullHistory} = this.state;
    this.setState({isViewingFullHistory: !isViewingFullHistory});
  }

  render() {
    const filteredDisciplineIncidents = this.filteredIncidents();

    return (
      <div className="LightBehaviorDetails">
        {this.renderDisciplineIncidents(filteredDisciplineIncidents)}
        {this.renderCleanSlateMessage()}
        {this.renderIncidentHistory(filteredDisciplineIncidents)}
      </div>
    );
  }

  renderCleanSlateMessage() {
    const {canViewFullHistory} = this.props;
    const {schoolYearsBack, isViewingFullHistory} = this.state;
    return (
      <CleanSlateMessage
        canViewFullHistory={canViewFullHistory}
        isViewingFullHistory={isViewingFullHistory}
        onToggleVisibility={this.onToggleCaseHistory}
        xAmountOfDataText={`${schoolYearsBack.textYears} of data`}
      />
    );
  }

  renderDisciplineIncidents(filteredDisciplineIncidents) {
    const phaselines = this.servicePhaselines().concat(this.filteredDataPhaselines());

    return (
      <ProfileBarChart
        events={filteredDisciplineIncidents}
        titleText="Discipline Incidents"
        id="disciplineChart"
        monthsBack={48} // always show 4 years for consistent scale and layout, regardless of filtering
        phaselines={phaselines} />
    );
  }

  renderIncidentHistory(filteredDisciplineIncidents) {
    return (
      <div>
        <DetailsSection anchorId="history" title="Incident History">
          <div style={{paddingTop: 20}}>{filteredDisciplineIncidents.length > 0
            ? this.renderIncidents(filteredDisciplineIncidents)
            : <div>No incident data.</div>
          }</div>
        </DetailsSection>
        {this.renderCleanSlateMessage()}
      </div>
    );
  }

  // Render these with a slightly different visual style than the feed (the background
  // color), just to mark this as different.
  renderIncidents(filteredDisciplineIncidents) {
    return (
      <div style={{width: '50%'}}>
        {filteredDisciplineIncidents.map(incident => {
          return <IncidentCard key={incident.id} style={{background: '#eee', marginBottom: 20}} incidentCard={incident} />;
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
  serviceTypesIndex: PropTypes.object.isRequired,
  canViewFullHistory: PropTypes.bool.isRequired
};
LightBehaviorDetails.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
