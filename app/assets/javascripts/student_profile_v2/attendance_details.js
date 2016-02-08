(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;
  var HighchartsWrapper = window.shared.HighchartsWrapper;

  var AttendanceDetails = window.shared.AttendanceDetails = React.createClass({
    displayName: 'AttendanceDetails',

    propTypes: {
      cumulativeDisciplineIncidents: React.PropTypes.array.isRequired,
      cumulativeAbsences: React.PropTypes.array.isRequired,
      cumulativeTardies: React.PropTypes.array.isRequired,
      disciplineIncidents: React.PropTypes.array.isRequired
    },

    getDefaultProps: function() {
      return {
        now: new Date(),
        intervalBack: [4, 'years']
      };
    },

    // TODO(kr) align these to school year?
    // The intent of fixing this date range is that when staff are looking at profile of different students,
    // the scales are consistent (and not changing between 3 mos and 6 years depending on the student's record,
    // since that's easy to miss and misinterpret.
    timestampRange: function() {
      return {
        min: moment(this.props.now).subtract(this.props.intervalBack[0], this.props.intervalBack[1]).toDate().getTime(),
        max: this.props.now.getTime()
      };
    },

    styles: {},

    // TODO(kr) clicking on data point jumps to timeline with full details
    render: function() {
      return dom.div({ className: 'AttendanceDetails' },
        this.renderDisciplineIncidents(),
        this.renderAbsencesAndTardies(),
        this.renderIncidentHistory()
      );
    },

    renderDisciplineIncidents: function() {
      return createEl(HighchartsWrapper, merge(this.baseOptions(), {
        title: {
          text: 'Discipline incidents, last 4 years',
          align: 'left'
        },
        yAxis: {
          min: 0,
          max: 6
        },
        series: [{
          name: 'Events per school year',
          data: this.quadsToPairs(this.props.cumulativeDisciplineIncidents)
        }]
      }));
    },

    renderAbsencesAndTardies: function() {
      return createEl(HighchartsWrapper, merge(this.baseOptions(), {
        title: {
          text: 'Absences and Tardies, last 4 years',
          align: 'left'
        },
        series: [{
          name: 'Absences per school year',
          data: this.quadsToPairs(this.props.cumulativeAbsences)
        }, {
          name: 'Tardies per school year',
          data: this.quadsToPairs(this.props.cumulativeTardies)
        }]
      }));
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

    // TODO(kr) factor out
    quadsToPairs: function(quads) {
      return quads.map(function(quad) {
        var date = Date.UTC(quad[0], quad[1] - 1, quad[2]);
        return [date, quad[3]];
      });
    },

    // TODO(kr) factor out
    baseOptions: function() {
      // TODO(kr) intervention plot bands, based on particular
      // interventions?
      var timestampRange = this.timestampRange();
      return merge(ProfileChartSettings.base_options, {
        xAxis: merge(ProfileChartSettings.x_axis_datetime, {
          plotLines: this.x_axis_bands,
          min: timestampRange.min,
          max: timestampRange.max
        }),
        yAxis: {
          min: 0,
          max: 20
        }
      });
    },

  });
})();