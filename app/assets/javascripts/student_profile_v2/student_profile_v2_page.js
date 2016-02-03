(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var Routes = window.shared.Routes;
  var Sparkline = window.shared.Sparkline;
  var AcademicSummary = window.shared.AcademicSummary;

  var SummaryList = React.createClass({
    render: function() {
      return dom.div({ style: { paddingBottom: 10 } },
        dom.div({ style: { fontWeight: 'bold' } }, this.props.title),
        dom.ul({}, this.props.elements.map(function(element, index) {
          return dom.li({ key: index }, element);
        }))
      );
    }
  });

  // define page component
  var styles = {
    page: {
      marginLeft: 20,
      marginRight: 20
    },
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
    academicColumn: {
      textAlign: 'center',
      flex: 3
    },
    column: {
      flex: 4,
      padding: 20,
      cursor: 'pointer'
    },
    selectedColumn: {
      border: '5px solid rgba(49, 119, 201, 0.64)',
      padding: 15
    },
    summaryWrapper: {
      paddingBottom: 10
    },
    sparklineWidth: 150,
    sparklineHeight: 50
  };

  var StudentProfileV2Page = window.shared.StudentProfileV2Page = React.createClass({
    displayName: 'StudentProfileV2Page',

    propTypes: {
      student: React.PropTypes.object.isRequired,
      interventionTypesIndex: React.PropTypes.object.isRequired,
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
        selectedColumnKey: 'profile'
      };
    },

    selectedColumnStyles: function(columnKey) {
      return (columnKey === this.state.selectedColumnKey) ? styles.selectedColumn : {};
    },

    onColumnClicked: function(columnKey) {
      this.setState({ selectedColumnKey: columnKey });
    },

    render: function() {
      return dom.div({ className: 'StudentProfileV2Page', style: styles.page },
        this.renderStudentName(),
        dom.div({ style: styles.summaryContainer },
          this.renderProfileColumn(),
          this.renderELAColumn(),
          this.renderMathColumn(),
          this.renderAttendanceColumn(),
          this.renderInterventionsColumn()
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

    renderProfileColumn: function() {
      var student = this.props.student;
      var columnKey = 'profile';

      return dom.div({
        style: merge(styles.column, this.selectedColumnStyles(columnKey)),
        onClick: this.onColumnClicked.bind(this, columnKey)
      },
        this.renderTitle('Demographics'),
        dom.div({}, 'Disability: ' + student.sped_level_of_need),
        dom.div({}, 'Low income: ' + student.free_reduced_lunch),
        dom.div({}, 'Language: ' + student.limited_english_proficiency)
      );
    },

    renderInterventionsColumn: function() {
      var student = this.props.student;
      var columnKey = 'interventions';

      return dom.div({
        style: merge(styles.column, this.selectedColumnStyles(columnKey)),
        onClick: this.onColumnClicked.bind(this, columnKey)
      }, this.padElements(styles.summaryWrapper, [
        this.renderPlacement(student),
        this.renderInterventions(student)
      ]));
    },

    renderPlacement: function(student) {
      var placement = (student.sped_placement !== null)
        ? student.program_assigned + ', ' + student.sped_placement
        : student.program_assigned;
      
      return createEl(SummaryList, {
        title: 'Placement',
        elements: [
          placement,
          'Homeroom ' + student.homeroom_name
        ]
      });
    },

    renderInterventions: function(student) {
      var elements = (student.interventions.length === 0) ? ['None'] : _.sortBy(student.interventions, 'start_date').map(function(intervention) {
        var interventionText = this.props.interventionTypesIndex[intervention.intervention_type_id].name;
        var daysText = moment(intervention.start_date).fromNow(true);
        return dom.span({},
          dom.span({}, interventionText),
          dom.span({ style: { opacity: 0.25, paddingLeft: 5 } }, daysText)
        );
      }, this);

      return createEl(SummaryList, {
        title: 'Interventions',
        elements: elements
      });
    },

    renderELAColumn: function() {
      var student = this.props.student;
      var chartData = this.props.chartData;
      var columnKey = 'ela';

      return dom.div({
        className: 'ela-background',
        style: merge(styles.column, styles.academicColumn, this.selectedColumnStyles(columnKey)),
        onClick: this.onColumnClicked.bind(this, columnKey)
      },
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
      var columnKey = 'math';

      return dom.div({
        className: 'math-background',
        style: merge(styles.column, styles.academicColumn, this.selectedColumnStyles(columnKey)),
        onClick: this.onColumnClicked.bind(this, columnKey)
      },
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
      var columnKey = 'attendance';

      return dom.div({
        className: 'attendance-background',
        style: merge(styles.column, styles.academicColumn, this.selectedColumnStyles(columnKey)),
        onClick: this.onColumnClicked.bind(this, columnKey)
      },
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
      _.sortBy(attendanceEvents, 'occurred_at').forEach(function(attendanceEvent) {
        var occurrenceDate = moment(attendanceEvent.occurred_at).toDate();
        cumulativeValue = cumulativeValue + 1;
        quads.push([occurrenceDate.getFullYear(), occurrenceDate.getMonth(), occurrenceDate.getDate(), cumulativeValue]);
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

    padElements: function(style, elements) {
      return dom.div({}, elements.map(function(element, index) {
        return dom.div({ key: index, style: style }, element);
      }));
    },

    renderTitle: function(text) {
      return dom.div({style: {fontWeight: "bold"} }, text);
    }
  });
})();
