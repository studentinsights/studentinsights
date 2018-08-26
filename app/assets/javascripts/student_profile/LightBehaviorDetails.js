import React from 'react';
import PropTypes from 'prop-types';
import {toMomentFromTimestamp, toMomentFromRailsDate} from '../helpers/toMoment';
import {toSchoolYear, firstDayOfSchool} from '../helpers/schoolYear';
import IncidentCard from '../components/IncidentCard';
import DetailsSection from './DetailsSection';
import ProfileBarChart, {servicePhaselines} from './ProfileBarChart';


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

  onToggleCaseHistory(e) {
    e.preventDefault();
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
    const {schoolYearsBack} = this.state;

    return (
      <div style={styles.cleanSlateMessage}>
        <div style={{fontWeight: 'bold'}}>A note about student privacy</div>
          <span>To respect student privacy, this page only shows {schoolYearsBack.textYears} of data by default.  </span>
          {canViewFullHistory
            ? this.renderCleanStateMessageForAdmin()
            : <span>If you need to know more about the student's case history, talk with an administrator who will have access to this data.</span>
          }
      </div>
    );
  }

  renderCleanStateMessageForAdmin() {
    const {isViewingFullHistory} = this.state;

    return (
      <span>
        <span>Before accessing older data, consider the balance between learning
        from these records and giving students a chance to start each year with a
        clean slate.</span>
        <a className="LightBehaviorDetails-show-history-link" href="#" style={styles.showLink} onClick={this.onToggleCaseHistory}>
          {isViewingFullHistory ? 'hide full case history' : 'show full case history'}
        </a>
      </span>
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

  renderIncidents(filteredDisciplineIncidents) {
    return (
      <div>
        {filteredDisciplineIncidents.map(incident => {
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
  serviceTypesIndex: PropTypes.object.isRequired,
  canViewFullHistory: PropTypes.bool.isRequired
};
LightBehaviorDetails.contextTypes = {
  nowFn: PropTypes.func.isRequired
};

const styles = {
  cleanSlateMessage: {
    padding: 10,
    paddingTop: 15,
    paddingBottom: 0
  },
  showLink: {
    display: 'inline-block',
    paddingLeft: 5,
    cursor: 'pointer',
    color: '#999'
  },
  privacyForFullList: {
    paddingTop: 20
  }
};
