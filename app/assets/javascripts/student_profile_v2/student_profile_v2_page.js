(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var Routes = window.shared.Routes;
  var Sparkline = window.shared.Sparkline;
  var AcademicSummary = window.shared.AcademicSummary;

  // define page component
  var styles = {
    titleContainer: {
      fontSize: 16,
      padding: 20
    },
    nameTitle: {
      fontSize: 20,
      fontWeight: 'bold'
    },
    titleItem: {
      padding: 5
    },
    summaryContainer: {
      display: 'flex',
      flexDirection: 'row',
      background: '#eee'
    },
    column: {
      textAlign: 'center',
      flex: 1
    },
    summaryWrapper: {
      padding: 20
    },
    sparklineWidth: 120,
    sparklineHeight: 50
  };

  var StudentProfileV2Page = window.shared.StudentProfileV2Page = React.createClass({
    displayName: 'StudentProfileV2Page',

    propTypes: {
      student: React.PropTypes.object.isRequired,
      chartData: React.PropTypes.shape({
        // ela
        most_recent_star_reading_percentile: React.PropTypes.number,
        most_recent_mcas_ela_scaled: React.PropTypes.number,
        most_recent_mcas_ela_growth: React.PropTypes.number,
        star_series_reading_percentile: React.PropTypes.array,
        mcas_series_ela_scaled: React.PropTypes.array,
        mcas_series_ela_growth: React.PropTypes.array,
        // math
        most_recent_star_math_percentile: React.PropTypes.number,
        most_recent_mcas_math_scaled: React.PropTypes.number,
        most_recent_mcas_math_growth: React.PropTypes.number,
        star_series_math_percentile: React.PropTypes.array,
        mcas_series_math_scaled: React.PropTypes.array,
        mcas_series_math_growth: React.PropTypes.array
      }),
      attendanceData: React.PropTypes.shape({
        discipline_incidents: React.PropTypes.array, // TODO(kr) case bug serializing from rails
        tardies: React.PropTypes.array,
        absences: React.PropTypes.array
      }),
      dateRange: React.PropTypes.array.isRequired
    },

    getInitialState: function() {
      return {
        selectedSectionKey: 'notes'
      };
    },

    render: function() {
      return dom.div({ className: 'StudentProfilePage' },
        this.renderStudentName(),
        dom.div({ style: styles.summaryContainer },
          this.renderDemographicsColumn(),
          this.renderELAColumn(),
          this.renderMathColumn(),
          this.renderAttendanceColumn(),
          dom.div({ style: { flex: 1 }}, 'behavior'),
          dom.div({ style: { flex: 1 }}, 'interventions')
        )
      );
    },

    renderStudentName: function() {
      var student =  this.props.student;
      return dom.div({ style: styles.titleContainer },
        dom.a({
          href: Routes.student(student.id),
          style: styles.nameTitle
        }, student.first_name + ' ' + student.last_name),
        dom.a({
          href: Routes.school(student.school_id),
          style: styles.titleItem
        }, student.school_name),
        dom.span({
          style: styles.titleItem
        }, student.grade),
        dom.a({
          href: Routes.homeroom(student.homeroom_id),
          style: styles.titleItem
        }, student.homeroom_name)
      );
    },

    renderDemographicsColumn: function() {
      var student = this.props.student;

      return dom.div({ style: { flex: 1 }},
        this.renderTitle('Demographics'),
        dom.div({}, 'Disability: ' + student.sped_level_of_need),
        dom.div({}, 'Low income: ' + student.free_reduced_lunch),
        dom.div({}, 'Language: ' + student.limited_english_proficiency)
      );
    },

    renderELAColumn: function() {
      var student = this.props.student;
      var chartData = this.props.chartData;

      return dom.div({ className: 'ela-background', style: styles.column},
        this.wrapSummary({
          caption: 'STAR Reading',
          value: student.most_recent_star_reading_percentile,
          sparkline: this.renderSparkline(chartData.star_series_reading_percentile)
        }),
        this.wrapSummary({
          caption: 'MCAS ELA',
          value: student.most_recent_mcas_ela_scaled,
          sparkline: this.renderSparkline(chartData.mcas_series_ela_scaled, {
            valueRange: [200, 300],
            thresholdValue: 240
          })
        }),
        this.wrapSummary({
          caption: 'MCAS ELA Growth',
          value: student.most_recent_mcas_ela_growth,
          sparkline: this.renderSparkline(chartData.mcas_series_ela_growth)
        })
      );
    },

    renderMathColumn: function() {
      var student = this.props.student;
      var chartData = this.props.chartData;

      return dom.div({ className: 'math-background', style: styles.column},
        this.wrapSummary({
          caption: 'STAR Math',
          value: student.most_recent_star_math_percentile,
          sparkline: this.renderSparkline(chartData.star_series_math_percentile)
        }),
        this.wrapSummary({
          caption: 'MCAS Math',
          value: student.most_recent_mcas_math_scaled,
          sparkline: this.renderSparkline(chartData.mcas_series_math_scaled, {
            valueRange: [200, 300],
            thresholdValue: 240
          })
        }),
        this.wrapSummary({
          caption: 'MCAS Math Growth',
          value: student.most_recent_mcas_math_growth,
          sparkline: this.renderSparkline(chartData.mcas_series_math_growth)
        })
      );
    },

    renderAttendanceColumn: function() {
      var student = this.props.student;
      var attendanceData = this.props.attendanceData;

      return dom.div({ className: 'attendance-background', style: styles.column},
        this.renderAttendanceEventsSummary(attendanceData.discipline_incidents, { caption: 'Discipline incidents' }),
        this.renderAttendanceEventsSummary(attendanceData.absences, { caption: 'Absences' }),
        this.renderAttendanceEventsSummary(attendanceData.tardies, { caption: 'Tardies' })
      );
    },

    renderAttendanceEventsSummary: function(attendanceEvents, props) {
      var cumulativeQuads = this.cumulativeCountQuads(attendanceEvents);
      var value = (cumulativeQuads.length > 0) ? _.last(cumulativeQuads)[3] : 0;

      return this.wrapSummary(merge({
        title: props.title,
        value: value,
        sparkline: this.renderSparkline(cumulativeQuads)
      }, props));
    },

    cumulativeCountQuads: function(attendanceEvents) {
      var cumulativeValue = 0;
      var quads = [];
      attendanceEvents.forEach(function(attendanceEvent) {
        var occurrenceDate = moment(attendanceEvent.occurred_at).toDate();
        cumulativeValue = cumulativeValue + 1;
        quads.push([occurrenceDate.getMonth(), occurrenceDate.getDate(), occurrenceDate.getYear(), cumulativeValue]);
      });

      return quads;      
    },

    // quads format is: [[year, month, day, value]]
    renderSparkline: function(quads, props) {
      var dateRange = this.props.dateRange;
      return createEl(Sparkline, merge({
        height: styles.sparklineHeight,
        width: styles.sparklineWidth,
        quads: quads,
        dateRange: dateRange,
        valueRange: [0, 100],
        thresholdValue: 50
      }, props || {}));
    },

    // render with style wrapper
    wrapSummary: function(props) {      
      return dom.div({ style: styles.summaryWrapper }, createEl(AcademicSummary, props));
    },

    renderTitle: function(text) {
      return dom.div({}, text);
    }
  });
})();