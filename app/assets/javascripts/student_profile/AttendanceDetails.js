import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import ProfileBarChart, {tooltipEventTextFn, createUnsafeTooltipFormatter} from './ProfileBarChart';
import IncidentCard from '../components/IncidentCard';
import * as InsightsPropTypes from '../helpers/InsightsPropTypes';


export default class AttendanceDetails extends React.Component {

  phaselines() {
    const activeServices = this.props.feed.services.active;

    const attendanceServiceTypes = [502, 503, 504, 505, 506];
    const attendanceServices = activeServices.filter(service => {
      return (attendanceServiceTypes.indexOf(service.service_type_id) > -1);
    });

    return attendanceServices.map(service => {
      const serviceText = this.props.serviceTypesIndex[service.service_type_id].name;

      return {
        momentUTC: moment.utc(service.date_started),
        text: 'Started ' + serviceText
      };
    });
  }

  render() {
    return (
      <div className="AttendanceDetails">
        {this.renderNavBar()}
        {this.renderDisciplineIncidents()}
        {this.renderAbsences()}
        {this.renderTardies()}
        {this.renderIncidentHistory()}
      </div>
    );
  }

  renderNavBar() {
    return (
      <div style={styles.navBar}>
        <a style={styles.navBar} href="#disciplineChart">
          Discipline Chart
        </a>
        {' | '}
        <a style={styles.navBar} href="#absences">
          Absences Chart
        </a>
        {' | '}
        <a style={styles.navBar} href="#tardies">
          Tardies Chart
        </a>
        {' | '}
        <a style={styles.navBar} href="#history">
          Incident History
        </a>
      </div>
    );
  }

  renderHeader(title) {
    return (
      <div style={styles.secHead}>
        <h4 style={styles.title}>
          {title}
        </h4>
        <span style={styles.navTop}>
          <a href="#">
            Back to top
          </a>
        </span>
      </div>
    );
  }

  renderDisciplineIncidents() {
    return (
      <ProfileBarChart
        events={this.props.disciplineIncidents}
        titleText="Discipline Incidents"
        id="disciplineChart"
        monthsBack={48}
        phaselines={this.phaselines()} />
    );
  }

  renderAbsences() {
    return (
      <ProfileBarChart
        events={this.props.absences}
        id="absences"
        titleText="Absences"
        monthsBack={48}
        phaselines={this.phaselines()}
        seriesFn={absenceSeriesFn}
        tooltipFn={absenceTooltipFn}
        />
    );
  }

  renderTardies() {
    return (
      <ProfileBarChart
        events={this.props.tardies}
        id="tardies"
        titleText="Tardies"
        monthsBack={48}
        phaselines={this.phaselines()} />
    );
  }

  renderIncidents() {
    return (
      <div style={{paddingTop: 60}}>
        {this.props.disciplineIncidents.map(incident => {
          return <IncidentCard key={incident.id} incident={incident} />;
        })}
      </div>
    );
  }

  renderIncidentHistory() {
    return (
      <div id="history" style={styles.container}>
        {this.renderHeader('Incident History')}
        {this.props.disciplineIncidents.length > 0
          ? this.renderIncidents()
          : <div style={{paddingTop: 60}}>
          No Incidents
        </div>}
      </div>
    );
  }

}

AttendanceDetails.propTypes = {
  absences: PropTypes.array.isRequired,
  tardies: PropTypes.array.isRequired,
  disciplineIncidents: PropTypes.array.isRequired,
  student: PropTypes.object.isRequired,
  feed: InsightsPropTypes.feed.isRequired,
  serviceTypesIndex: PropTypes.object.isRequired
};


function absenceSeriesFn(monthBuckets) {
  return [{
    name: 'Excused',
    color: '#ccc',
    showInLegend: true,
    data: _.map(monthBuckets, es => es.filter(e => e.excused).length)
  },
  {
    name: 'Unexcused absences',
    color: '#7cb5ec',
    showInLegend: true,
    data: _.map(monthBuckets, es => es.filter(e => !e.excused).length)
  }];
}


function absenceTooltipFn(monthBuckets) {
  return {
    formatter: createUnsafeTooltipFormatter(monthBuckets, tooltipTextFn),
    useHTML: true
  };
}

function tooltipTextFn(e) {
  const date = tooltipEventTextFn(e);
  const explanation = absenceExplanationText(e);
  return `${date}${explanation}`;
}

function absenceExplanationText(absence) {
  if (absence.excused && absence.reason && absence.comment) {
    return ` (Excused, ${absence.reason}, ${absence.comment})`;
  } else if (absence.excused && absence.reason) {
    return ` (Excused, ${absence.reason})`;
  } else if (absence.excused) {
    return ` (Excused)`;
  } else if (absence.reason) {
    return ` (${absence.reason})`;
  } else if (absence.comment) {
    return ` (${absence.comment})`;
  }

  return '';
}


const styles = {
  title: {
    color: 'black',
    paddingBottom: 20,
    fontSize: 24
  },
  container: {
    width: '100%',
    marginTop: 50,
    marginLeft: 'auto',
    marginRight: 'auto',
    border: '1px solid #ccc',
    padding: '30px 30px 30px 30px',
    position: 'relative'
  },
  secHead: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    bottom: 10
  },
  navBar: {
    fontSize: 18
  },
  navTop: {
    textAlign: 'right',
    verticalAlign: 'text-top'
  }
};

