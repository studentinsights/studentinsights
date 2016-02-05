(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var Routes = window.shared.Routes;
  var Sparkline = window.shared.Sparkline;
  var AcademicSummary = window.shared.AcademicSummary;
  var ELADetails = window.shared.ELADetails;

  var InterventionsDetails = React.createClass({
    propTypes: {
      interventionTypesIndex: React.PropTypes.object.isRequired
    },
    
    styles: {
      container: {
        display: 'flex'
      },
      notesContainer: {
        flex: 1
      },
      interventionsContainer: {
        flex: 1
      },
      inlineBlock: {
        display: 'inline-block'
      },
      userText: {
        whiteSpace: 'pre-wrap'
      },
      daysAgo: {
        opacity: 0.25,
        paddingLeft: 10,
        display: 'inline-block'
      },
      title: {
        borderBottom: '1px solid #333',
        fontWeight: 'bold',
        padding: 10,
        paddingLeft: 0
      },
      date: {
        padding: 10,
        paddingLeft: 0,
        fontWeight: 'bold',
        display: 'inline-block'
      },
      educator: {
        padding: 10,
        paddingLeft: 5,
        display: 'inline-block'
      },
      expandedNote: {},
      collapsedNote: {
        maxHeight: '2em',
        overflowY: 'hidden'
      },
      addButton: {
        fontSize: 24,
        outline: '1px solid black',
        padding: '0px 5px',
        marginLeft: 10,

      }
    },

    getInitialState: function() {
      return {
        expandedNoteIds: []
      }
    },

    isExpanded: function(note) {
      return (this.state.expandedNoteIds.indexOf(note.id) !== -1);
    },

    onNoteClicked: function(note) {
      var updatedNoteIds = (this.isExpanded(note))
        ? _.without(this.state.expandedNoteIds, note.id)
        : this.state.expandedNoteIds.concat(note.id);
      this.setState({ expandedNoteIds: updatedNoteIds });
    },

    render: function() {
      return dom.div({ className: 'InterventionsDetails', style: this.styles.container },
        dom.div({ style: this.styles.notesContainer },
          dom.div({ style: this.styles.title},
            'Notes',
            dom.span({ style: this.styles.addButton }, '+')
          ),
          this.props.notes.map(this.renderNote)
        ),
        dom.div({ style: this.styles.interventionsContainer },
          dom.div({ style: this.styles.title},
            'Interventions',
            dom.span({ style: this.styles.addButton }, '+')
          ),
          this.props.student.interventions.map(this.renderIntervention)
        )
      );
    },

    // allow editing, fixup.  'no longer active'
    renderIntervention: function(intervention) {
      var interventionText = this.props.interventionTypesIndex[intervention.intervention_type_id].name;
      var daysText = moment(intervention.start_date).fromNow(true);
      return dom.div({ key: intervention.id },
        dom.span({ style: this.styles.inlineBlock }, interventionText),
        dom.span({ style: this.styles.daysAgo }, daysText),
        dom.div({}, 'Teacher ' + intervention.educator_id), // TODO(kr)
        dom.div({ style: merge(this.styles.userText, { paddingTop: 15 }) }, intervention.comment)
      );
    },

    renderNote: function(note) {
      var styles = this.styles;
      var isExpanded = this.isExpanded(note);
      return dom.div({
        key: note.id,
        onClick: this.onNoteClicked.bind(this, note),
      },
        dom.div({},
          dom.span({ style: styles.date }, moment(note.created_at_timestamp).format('MMMM D, YYYY')),
          '|',
          dom.span({ style: styles.educator }, note.educator_email)
        ),
        dom.div({ style: { whiteSpace: 'pre-wrap' } },
          dom.div({ style: (isExpanded) ? styles.expandedNote : styles.collapsedNote }, note.content),
          (isExpanded ? null : dom.div({}, '(see more)'))
        )
      );
    }
  });

  var ProfileDetails = React.createClass({
    render: function() {
      return dom.div({}, 'profile');
    }
  });


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
    detailsContainer: {
      margin: 30
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
      queryParams: React.PropTypes.object,
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

    getDefaultProps: function() {
      return { queryParams: {} };
    },

    getInitialState: function() {
      return {
        selectedColumnKey: this.props.queryParams.column || 'interventions'
      };
    },

    componentDidUpdate: function(props, state) {
      var path = Routes.studentProfile(this.props.student.id, {
        column: this.state.selectedColumnKey
      });
      window.history.replaceState({}, null, path);
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
        ),
        dom.div({ style: styles.detailsContainer }, this.renderSectionDetails())
      );
    },

    renderSectionDetails: function() {
      // TODO(kr) make factoring more explicit
      var props = {
        student: this.props.student,
        notes: this.props.notes,
        interventionTypesIndex: this.props.interventionTypesIndex
      };
      switch (this.state.selectedColumnKey) {
        case 'profile': return createEl(ProfileDetails, props); break;
        case 'interventions': return createEl(InterventionsDetails, props); break;
        case 'ela': return createEl(ELADetails, { chartData: this.props.chartData }); break;
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
        return dom.span({ key: intervention.id },
          dom.span({}, interventionText),
          dom.span({ style: { opacity: 0.25, paddingLeft: 10 } }, daysText)
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
          sparkline: this.renderSparkline(chartData.star_series_reading_percentile || [])
        }),
        this.wrapSummary({
          caption: 'MCAS ELA',
          value: student.most_recent_mcas_ela_scaled,
          sparkline: this.renderSparkline(chartData.mcas_series_ela_scaled || [], {
            valueRange: [200, 300],
            thresholdValue: 240
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
            valueRange: [200, 300],
            thresholdValue: 240
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
          valueRange: [0, 6],
          thresholdValue: 3
        }),
        this.renderAttendanceEventsSummary(attendanceData.absences, {
          caption: 'Absences',
          valueRange: [0, 20],
          thresholdValue: 10
        }),
        this.renderAttendanceEventsSummary(attendanceData.tardies, {
          caption: 'Tardies',
          valueRange: [0, 20],
          thresholdValue: 10
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

    toCumulativeQuads: function(yearAttendanceEvents) {
      var cumulativeValue = 0;
      var quads = [];
      _.sortBy(yearAttendanceEvents, 'occurred_at').forEach(function(attendanceEvent) {
        var occurrenceDate = moment(attendanceEvent.occurred_at).toDate();
        cumulativeValue = cumulativeValue + 1;
        quads.push([occurrenceDate.getFullYear(), occurrenceDate.getMonth() + 1, occurrenceDate.getDate(), cumulativeValue]);
      });

      return quads;
    },

    schoolYearStart: function(eventMoment) {
      var year = eventMoment.year();
      var isFallSeason = (eventMoment.month() >= 8 && eventMoment.date() > 15);
      return (isFallSeason) ? year : year - 1;
    },

    cumulativeStartDate: function(start) {
      var schoolYearStart = this.schoolYearStart(moment(start));
      return new Date(schoolYearStart, 8, 15);
    },

    allSchoolYearStarts: function(dateRange) {
      var schoolYearStarts = dateRange.map(function(date) {
        return this.schoolYearStart(moment(date));
      }, this);
      return _.range(schoolYearStarts[0], schoolYearStarts[1] + 1);
    },

    // Fills in data points for start of the school year (8/15) and for current day.
    cumulativeCountQuads: function(attendanceEvents) {
      var currentYearStart = this.schoolYearStart(moment(this.props.now));
      var schoolYearStarts = this.allSchoolYearStarts(this.props.dateRange);
      var quads = [];
      schoolYearStarts.sort().forEach(function(schoolYearStart) {
        var yearAttendanceEvents = attendanceEvents.filter(function(attendanceEvent) {
          return this.schoolYearStart(moment(attendanceEvent.occurred_at)) === schoolYearStart;
        }, this);
        var cumulativeEventQuads = this.toCumulativeQuads(yearAttendanceEvents);
        var startOfYearQuad = [schoolYearStart, 8, 15, 0];
        quads.push(startOfYearQuad);
        cumulativeEventQuads.forEach(function(cumulativeQuad) { quads.push(cumulativeQuad); });
        var lastValue = (cumulativeEventQuads.length === 0) ? 0 : _.last(cumulativeEventQuads)[3];
        if (schoolYearStart === currentYearStart) {
          quads.push([this.props.now.getFullYear(), this.props.now.getMonth() + 1, this.props.now.getDate(), lastValue]);
        }
      }, this);

      return quads;
    },

    // quads format is: [[year, month (Ruby), day, value]]
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
