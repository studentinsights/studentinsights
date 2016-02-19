(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var Chart = window.shared.Chart;
  var Scales = window.shared.Scales;

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
      return createEl(Chart, {
        title: 'Discipline incidents, last 4 years',
        yAxis: {
          min: range[0],
          max: range[1]
        },
        series: [{
          name: 'Events per school year',
          data: this.props.cumulativeDisciplineIncidents
        }]
      });
    },

    renderAbsencesAndTardies: function() {
      return createEl(Chart, {
        title: 'Absences and Tardies, last 4 years',
        yAxis: {
          min: _.min([Scales.absences.valueRange[0], Scales.tardies.valueRange[0]]),
          max: _.max([Scales.absences.valueRange[1], Scales.tardies.valueRange[1]])
        },
        series: [{
          name: 'Tardies per school year',
          data: this.props.cumulativeTardies
        }, {
          name: 'Absences per school year',
          data: this.props.cumulativeAbsences
        }]
      });
    },

    renderIncidentHistory: function() {
      return dom.div({}, this.props.disciplineIncidents.map(function(incident) {
        return dom.div({ key: incident.occurred_at },
          dom.div({}, 'Date: ' + moment.utc(incident.occurred_at).format('MMM D, YYYY')),
          dom.div({}, 'Code:' + incident.incident_code),
          dom.div({}, 'Location: ' + incident.incident_location),
          dom.div({}, 'Description: ' + incident.incident_description)
        );
      }));
    },
  });
})();