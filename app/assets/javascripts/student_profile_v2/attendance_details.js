(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var ProfileChart = window.shared.ProfileChart;
  var Scales = window.shared.Scales;

  var styles = {
    box: {
      border: '1px solid #eee',
      padding:15,
      marginTop: 10,
      marginBottom: 10,
      width: '100%'
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
      borderBottom: '1px solid #333',
      paddingBottom: 10,
      marginBottom: 20,
      marginTop: 20,
      fontSize: 24
    },
    container: {
      width: '50%'
    },
    centerItem: {
      paddingBottom: 10,
      textAlign: 'center',
      width: 75
    }
  };

  var AttendanceDetails = window.shared.AttendanceDetails = React.createClass({
    displayName: 'AttendanceDetails',
    propTypes: {
      cumulativeDisciplineIncidents: React.PropTypes.array.isRequired,
      cumulativeAbsences: React.PropTypes.array.isRequired,
      cumulativeTardies: React.PropTypes.array.isRequired,
      disciplineIncidents: React.PropTypes.array.isRequired
    },

    // TODO(kr) clicking on data point jumps to timeline with full details
    render: function() {
      return dom.div({ className: 'AttendanceDetails' },
        this.renderDisciplineIncidents(),
        this.renderAbsencesAndTardies(),
        this.renderIncidentHistory()
      );
    },

    renderDisciplineIncidents: function() {
      var range = Scales.disciplineIncidents.valueRange;
      return createEl(ProfileChart, {
        titleText: 'Discipline incidents, last 4 years',
        yAxis: {
          min: range[0],
          max: range[1]
        },
        quadSeries: [{
          name: 'Events per school year',
          data: this.props.cumulativeDisciplineIncidents
        }]
      });
    },

    renderAbsencesAndTardies: function() {
      return createEl(ProfileChart, {
        titleText: 'Absences and Tardies, last 4 years',
        yAxis: {
          min: _.min([Scales.absences.valueRange[0], Scales.tardies.valueRange[0]]),
          max: _.max([Scales.absences.valueRange[1], Scales.tardies.valueRange[1]])
        },
        quadSeries: [{
          name: 'Tardies per school year',
          data: this.props.cumulativeTardies
        }, {
          name: 'Absences per school year',
          data: this.props.cumulativeAbsences
        }]
      });
    },

    renderIncidentHistory: function() {
      return dom.div({ style: styles.container },
        dom.h4({ style: styles.title }, 'Incident History'),
        this.props.disciplineIncidents.map(function(incident) {
        return dom.div({ style: styles.box, key: incident.occurred_at },
          dom.div({ style: styles.header },
            dom.div({ style: styles.item }, dom.span({ style: styles.itemHead }, 'Date: '), dom.span({}, moment.utc(incident.occurred_at).format('MMM D, YYYY'))),
            dom.div({ style: styles.centerItem }, dom.span({ style: styles.itemHead }, 'Code: '), dom.span({}, incident.incident_code)),
            dom.div({ style: styles.item }, dom.span({ style: styles.itemHead }, 'Location: '), dom.span({}, incident.incident_location))
          ),
          dom.div({}, dom.span({ style: styles.desc }, 'Description: '), dom.div({}, incident.incident_description))
        )
      }));
    },
  });
})();