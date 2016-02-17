(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var Routes = window.shared.Routes;
  var PropTypes = window.shared.PropTypes;
  var Sparkline = window.shared.Sparkline;
  var AcademicSummary = window.shared.AcademicSummary;
  var SummaryList = window.shared.SummaryList;
  var QuadConverter = window.shared.QuadConverter;
  var Scales = window.shared.Scales;
  var Educator = window.shared.Educator;

  var ProfileDetails = window.shared.ProfileDetails;
  var ELADetails = window.shared.ELADetails;
  var MathDetails = window.shared.MathDetails;
  var AttendanceDetails = window.shared.AttendanceDetails;
  var InterventionsDetails = window.shared.InterventionsDetails;


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
    detailsContainer: {
      margin: 30
    },
    academicColumn: {
      textAlign: 'center',
      flex: 3
    },
    column: {
      flex: 5,
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
      //context
      nowMomentFn: React.PropTypes.func.isRequired,
      currentEducator: React.PropTypes.object.isRequired,
      
      // constants
      interventionTypesIndex: React.PropTypes.object.isRequired,
      educatorsIndex: React.PropTypes.object.isRequired,

      // data
      student: React.PropTypes.object.isRequired,
      feed: React.PropTypes.object.isRequired,
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

      // flux-y bits
      requests: PropTypes.requests,
      actions: PropTypes.actions
    },

    onColumnClicked: function(columnKey) {
      this.props.actions.onColumnClicked(columnKey);
    },

    dateRange: function() {
      var nowMoment = this.props.nowMomentFn();
      return [nowMoment.clone().subtract(2, 'year').toDate(), nowMoment.toDate()];
    },

    selectedColumnStyles: function(columnKey) {
      return (columnKey === this.props.selectedColumnKey) ? styles.selectedColumn : {};
    },

    // Merges data from event_notes, services and deprecated tables (notes, interventions).
    mergedNotes: function() {
      var v1Notes = this.props.feed.v1_notes.map(function(note) { return merge(note, { version: 'v1', sort_timestamp: note.created_at_timestamp }); });
      var v2Notes = this.props.feed.event_notes.map(function(note) { return merge(note, { version: 'v2', sort_timestamp: note.recorded_at }); });
      // TODO(kr) v1 interventions as notes
      // TODO(kr) v1 interventions progress notes as notes
      return _.sortBy(v1Notes.concat(v2Notes), 'sort_timestamp').reverse();
    },

    render: function() {
      return dom.div({ className: 'StudentProfileV2Page', style: styles.page },
        this.renderSaveStatus(),
        this.renderStudentName(),
        dom.div({ className: 'summary-container', style: styles.summaryContainer },
          this.renderProfileColumn(),
          this.renderELAColumn(),
          this.renderMathColumn(),
          this.renderAttendanceColumn(),
          this.renderInterventionsColumn()
        ),
        dom.div({ style: styles.detailsContainer }, this.renderSectionDetails())
      );
    },

    renderSaveStatus: function() {
      var activeRequestCount = _.where(_.values(this.props.requests), { state: 'pending' }).length;
      return dom.div({
        style: {
          position: 'fixed',
          left: 10,
          top: 10,
          padding: 10,
          opacity: (activeRequestCount === 0) ? 0 : 0.75,
          borderRadius: 2,
          background: 'rgb(74,144,226)'
        }
      },
        dom.div({ style: { color: 'white' } }, 'Saving...')
      );
    },

    renderSectionDetails: function() {
      switch (this.props.selectedColumnKey) {
        case 'profile': return createEl(ProfileDetails, {});
        case 'ela': return createEl(ELADetails, { chartData: this.props.chartData });
        case 'math': return createEl(MathDetails, { chartData: this.props.chartData });
        case 'attendance':
          var attendanceData = this.props.attendanceData;
          return createEl(AttendanceDetails, {
            cumulativeDisciplineIncidents: this.cumulativeCountQuads(attendanceData.discipline_incidents),
            cumulativeAbsences: this.cumulativeCountQuads(attendanceData.absences),
            cumulativeTardies: this.cumulativeCountQuads(attendanceData.tardies),
            disciplineIncidents: attendanceData.discipline_incidents
          });
        case 'interventions':
          return createEl(InterventionsDetails, merge(_.pick(this.props,
            'currentEducator',
            'student',
            'interventionTypesIndex',
            'educatorsIndex',
            'actions',
            'requests'
          ), {
            mergedNotes: this.mergedNotes()
          }));
      }
      return null;
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
        createEl(SummaryList, {
          title: 'Demographics',
          elements: [
            'Disability: ' + (student.sped_level_of_need || 'None'),
            'Low income: ' + student.free_reduced_lunch,
            'Language: ' + student.limited_english_proficiency
          ]
        })
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
        this.renderInterventions(student),
        this.renderStaff(student)
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
      if (student.interventions.length === 0) {
        return createEl(SummaryList, {
          title: 'Services',
          elements: ['No services']
        });
      }

      var limit = 3;
      var sortedInterventions = _.sortBy(student.interventions, 'start_date').reverse();
      var elements = sortedInterventions.slice(0, limit).map(function(intervention) {
        var interventionText = this.props.interventionTypesIndex[intervention.intervention_type_id].name;
        var daysText = moment.utc(intervention.start_date).from(this.props.nowMomentFn(), true);
        return dom.span({ key: intervention.id },
          dom.span({}, interventionText),
          dom.span({ style: { opacity: 0.25, paddingLeft: 10 } }, daysText)
        );
      }, this);
      if (sortedInterventions.length > limit) elements.push(dom.div({}, '+ ' + (sortedInterventions.length - limit) + ' more'));
      return createEl(SummaryList, {
        title: 'Services',
        elements: elements
      });
    },

    renderStaff: function(student) {
      var limit = 3;
      var mergedNotes = this.mergedNotes();
      var educatorIds = _.unique(_.pluck(mergedNotes, 'educator_id'));
      var elements = educatorIds.slice(0, limit).map(function(educatorId) {
        return createEl(Educator, { educator: this.props.educatorsIndex[educatorId] });
      }, this);
      
      if (educatorIds.length > limit) elements.push(dom.span({}, '+ ' + (educatorIds.length - limit) + ' more'));
      return createEl(SummaryList, {
        title: 'Staff',
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
          sparkline: this.renderSparkline(chartData.star_series_reading_percentile || [])
        }),
        this.wrapSummary({
          caption: 'MCAS ELA',
          value: student.most_recent_mcas_ela_scaled,
          sparkline: this.renderSparkline(chartData.mcas_series_ela_scaled || [], {
            valueRange: Scales.mcas.valueRange,
            thresholdValue: Scales.mcas.threshold
          })
        }),
        this.wrapSummary({
          caption: 'MCAS ELA Growth',
          value: student.most_recent_mcas_ela_growth,
          sparkline: this.renderSparkline(chartData.mcas_series_ela_growth || [])
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
          sparkline: this.renderSparkline(chartData.star_series_math_percentile || [])
        }),
        this.wrapSummary({
          caption: 'MCAS Math',
          value: student.most_recent_mcas_math_scaled,
          sparkline: this.renderSparkline(chartData.mcas_series_math_scaled || [], {
            valueRange: Scales.mcas.valueRange,
            thresholdValue: Scales.mcas.threshold
          })
        }),
        this.wrapSummary({
          caption: 'MCAS Math Growth',
          value: student.most_recent_mcas_math_growth,
          sparkline: this.renderSparkline(chartData.mcas_series_math_growth || [])
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
        this.renderAttendanceEventsSummary(attendanceData.discipline_incidents, {
          caption: 'Discipline incidents',
          valueRange: Scales.disciplineIncidents.valueRange,
          thresholdValue: Scales.disciplineIncidents.threshold,
          shouldDrawCircles: false
        }),
        this.renderAttendanceEventsSummary(attendanceData.absences, {
          caption: 'Absences',
          valueRange: Scales.absences.valueRange,
          thresholdValue: Scales.absences.threshold,
          shouldDrawCircles: false
        }),
        this.renderAttendanceEventsSummary(attendanceData.tardies, {
          caption: 'Tardies',
          valueRange: Scales.tardies.valueRange,
          thresholdValue: Scales.tardies.threshold,
          shouldDrawCircles: false
        })
      );
    },

    renderAttendanceEventsSummary: function(attendanceEvents, props) {
      var cumulativeQuads = this.cumulativeCountQuads(attendanceEvents);
      var value = (cumulativeQuads.length > 0) ? _.last(cumulativeQuads)[3] : 0;

      return this.wrapSummary(merge({
        title: props.title,
        value: value,
        sparkline: this.renderSparkline(cumulativeQuads, props)
      }, props));
    },

    cumulativeCountQuads: function(attendanceEvents) {
      return QuadConverter.convert(attendanceEvents, this.props.nowMomentFn().toDate(), this.dateRange());
    },

    // quads format is: [[year, month (Ruby), day, value]]
    renderSparkline: function(quads, props) {
      return createEl(Sparkline, merge({
        height: styles.sparklineHeight,
        width: styles.sparklineWidth,
        quads: quads,
        dateRange: this.dateRange(),
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
