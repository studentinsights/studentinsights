import ProfileBarChart from './ProfileBarChart.js';
import PropTypes from '../helpers/prop_types.jsx';

const styles = {
  box: {
    border: '1px solid #ccc',
    padding:15,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    backgroundColor: '#f2f2f2'
  },
  item: {
    paddingBottom: 10,
    width: 160
  },
  itemHead: {
    fontWeight: 'bold',
  },
  header: {
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'space-between'
  },
  desc: {
    fontWeight: 'bold',
    paddingTop: 30
  },
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
  centerItem: {
    paddingBottom: 10,
    textAlign: 'center',
    width: 75
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

class AttendanceDetails extends React.Component {

  phaselines() {
    const activeServices = this.props.feed.services.active;

    const attendanceServiceTypes = [502, 503, 504, 505, 506];
    const attendanceServices = activeServices.filter(function (service) {
      return (attendanceServiceTypes.indexOf(service.service_type_id) > -1);
    });

    return attendanceServices.map(function (service) {
      const serviceText = this.props.serviceTypesIndex[service.service_type_id].name;

      return {
        momentUTC: moment.utc(service.date_started),
        text: 'Started ' + serviceText
      };
    }, this);
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
        tooltipTemplateString="<span><a href='#history' style='font-size: 12px'><%= moment.utc(e.occurred_at).format('MMMM Do, YYYY')%></a></span>"
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
        phaselines={this.phaselines()} />
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
        {this.props.disciplineIncidents.map(function(incident) {
          return (
            <div style={styles.box} key={incident.id}>
              <div style={styles.header}>
                <div style={styles.item}>
                  <span style={styles.itemHead}>
                    {'Date: '}
                  </span>
                  <span>
                    {moment.utc(incident.occurred_at).format('MMM D, YYYY')}
                  </span>
                </div>
                <div style={styles.centerItem}>
                  <span style={styles.itemHead}>
                    {'Code: '}
                  </span>
                  <span>
                    {incident.incident_code}
                  </span>
                </div>
                <div style={styles.item}>
                  <span style={styles.itemHead}>
                    {'Location: '}
                  </span>
                  <span>
                    {incident.incident_location}
                  </span>
                </div>
              </div>
              <div>
                <span style={styles.desc}>
                  {'Description: '}
                </span>
              </div>
              <div>
                {incident.incident_description}
              </div>
            </div>
          );

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
  absences: React.PropTypes.array.isRequired,
  tardies: React.PropTypes.array.isRequired,
  disciplineIncidents: React.PropTypes.array.isRequired,
  student: React.PropTypes.object.isRequired,
  feed: PropTypes.feed.isRequired,
  serviceTypesIndex: React.PropTypes.object.isRequired
};

export default AttendanceDetails;
