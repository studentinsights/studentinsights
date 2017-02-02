(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var ProfileChart = window.shared.ProfileChart;
  var ProfileBarChart = window.shared.ProfileBarChart;
  var HighchartsWrapper = window.shared.HighchartsWrapper;
  var PropTypes = window.shared.PropTypes;

  var styles = {
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
      borderBottom: '1px solid #333',
      position: 'absolute',
      top: 30,
      left: 30,
      right: 30
    },
    navBar: {
      fontSize: 18
    },
    navTop: {
      textAlign: 'right',
      verticalAlign: 'text-top'
    }
  };

  var AttendanceDetails = window.shared.AttendanceDetails = React.createClass({
    displayName: 'AttendanceDetails',
    propTypes: {
      absences: React.PropTypes.array.isRequired,
      tardies: React.PropTypes.array.isRequired,
      disciplineIncidents: React.PropTypes.array.isRequired,
      student: React.PropTypes.object.isRequired,
      feed: PropTypes.feed.isRequired,
      serviceTypesIndex: React.PropTypes.object.isRequired
    },

    phaselines: function () {
      var activeServices = this.props.feed.services.active;

      var attendanceServiceTypes = [502, 503, 504, 505, 506];
      var attendanceServices = activeServices.filter(function (service) {
        return (attendanceServiceTypes.indexOf(service.service_type_id) > -1);
      });

      return attendanceServices.map(function (service) {
        var serviceText = this.props.serviceTypesIndex[service.service_type_id].name;

        return {
          momentUTC: moment.utc(service.date_started),
          text: 'Started ' + serviceText
        };
      }, this);
    },

    render: function() {
      return dom.div({ className: 'AttendanceDetails' },
        this.renderNavBar(),
        this.renderDisciplineIncidents(),
        this.renderAbsences(),
        this.renderTardies(),
        this.renderIncidentHistory()
      );
    },

    renderNavBar: function() {
      return dom.div({ style: styles.navBar },
          dom.a({ style: styles.navBar, href: '#disciplineChart'}, 'Discipline Chart'), ' | ',
          dom.a({ style: styles.navBar, href: '#absences'}, 'Absences Chart'), ' | ',
          dom.a({ style: styles.navBar, href: '#tardies'}, 'Tardies Chart'), ' | ',
          dom.a({ style: styles.navBar, href: '#history'}, 'Incident History')
        );
    },

    renderHeader: function(title) {
      return dom.div({ style: styles.secHead },
        dom.h4({ style: styles.title }, title),
        dom.span({ style: styles.navTop }, dom.a({ href: '#' }, 'Back to top'))
      );
    },

    renderDisciplineIncidents: function() {
      return createEl(ProfileBarChart, {
        events: this.props.disciplineIncidents,
        titleText: 'Discipline Incidents',
        id: "disciplineChart",
        monthsBack: 48,
        tooltipTemplateString: "<span><a href='#history' style='font-size: 12px'><%= moment.utc(e.occurred_at).format('MMMM Do, YYYY')%></a></span>",
        phaselines: this.phaselines()
      });
    },

    renderAbsences: function() {
      return createEl(ProfileBarChart, {
        events: this.props.absences,
        id: "absences",
        titleText: 'Absences',
        monthsBack: 48,
        phaselines: this.phaselines()
      });
    },

    renderTardies: function() {
      return createEl(ProfileBarChart, {
        events: this.props.tardies,
        id: "tardies",
        titleText: 'Tardies',
        monthsBack: 48,
        phaselines: this.phaselines()
      });
    },

    renderIncidents: function() {
      return dom.div({ style: {paddingTop: 60} }, this.props.disciplineIncidents.map(function(incident) {
        return dom.div({ style: styles.box, key: incident.id},
          dom.div({ style: styles.header },
            dom.div({ style: styles.item },
              dom.span({ style: styles.itemHead }, 'Date: '),
              dom.span({}, moment.utc(incident.occurred_at).format('MMM D, YYYY'))
              ),
            dom.div({ style: styles.centerItem },
              dom.span({ style: styles.itemHead }, 'Code: '),
              dom.span({}, incident.incident_code)
              ),
            dom.div({ style: styles.item },
              dom.span({ style: styles.itemHead }, 'Location: '),
              dom.span({}, incident.incident_location)
            )
          ),
          dom.div({}, dom.span({ style: styles.desc }, 'Description: ')),
          dom.div({}, incident.incident_description))

      }));
    },

    renderIncidentHistory: function() {
      return dom.div({ id: "history", style: styles.container },
        this.renderHeader('Incident History'),
        this.props.disciplineIncidents.length > 0
          ? this.renderIncidents()
          : dom.div({ style: {paddingTop: 60}}, 'No Incidents')
      );
    },
  });
})();
