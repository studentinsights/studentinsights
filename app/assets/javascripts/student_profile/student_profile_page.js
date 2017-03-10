(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var Routes = window.shared.Routes;
  var PropTypes = window.shared.PropTypes;
  var BarChartSparkline = window.shared.BarChartSparkline;
  var Sparkline = window.shared.Sparkline;
  var AcademicSummary = window.shared.AcademicSummary;
  var SummaryWithoutSparkline = window.shared.SummaryWithoutSparkline;
  var SummaryList = window.shared.SummaryList;
  var QuadConverter = window.shared.QuadConverter;
  var Scales = window.shared.Scales;
  var FeedHelpers = window.shared.FeedHelpers;

  var StudentProfileHeader = window.shared.StudentProfileHeader;
  var ProfileDetails = window.shared.ProfileDetails;
  var ELADetails = window.shared.ELADetails;
  var MathDetails = window.shared.MathDetails;
  var AttendanceDetails = window.shared.AttendanceDetails;
  var InterventionsDetails = window.shared.InterventionsDetails;
  var ServicesDetails = window.shared.ServicesDetails;
  var NotesDetails = window.shared.NotesDetails;


  // define page component
  var styles = {
    summaryContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '95%',

    },
    detailsContainer: {
      margin: 30
    },
    academicColumn: {
      textAlign: 'left',
    },
    profileColumn: {
      background: '#ededed'
    },
    interventionsColumn: {
      background: '#ededed'
    },
    column: {
      flexGrow: '1',
      flexShrink: '0',
      padding: '22px 26px 16px 26px',
      cursor: 'pointer',
      borderColor: 'white',
      borderTop: 0,
      margin: 0,
      borderRadius: '0 0 5px 5px',
      width: '100%'
    },
    columnContainer: {
      display: 'flex',
      flexDirection: 'column',
      margin: '0 5px 0 0',
      borderRadius: '5px 5px 5px 5px',
      border: '1px solid #ccc',
      width: '20%',
     },
    selectedColumn: {
      borderStyle: 'solid',
      borderColor: '#3177c9',
      borderWidth: '0 5px 5px 5px',
      padding: '22px 21px 11px 21px',
    },
    selectedTab: {
      background: '#3177c9',
      color: 'white',
      borderBottom: 0,
    },
    summaryWrapper: {
      paddingBottom: 10
    },
    tab: {
      fontWeight: 'bold',
      width: '100%',
      height: 40,
      borderBottom: 0,
      textAlign: 'center',
      padding: '10px 5px 5px 5px',
      margin: 0,
      borderRadius: '5px 5px 0 0',
      background: 'white',
      cursor: 'pointer'
    },
    sparklineWidth: 150,
    sparklineHeight: 50
  };


  var StudentProfilePage = window.shared.StudentProfilePage = React.createClass({
    displayName: 'StudentProfilePage',

    propTypes: {
      // context
      nowMomentFn: React.PropTypes.func.isRequired,
      currentEducator: React.PropTypes.object.isRequired,

      // constants
      educatorsIndex: React.PropTypes.object.isRequired,
      serviceTypesIndex: React.PropTypes.object.isRequired,
      eventNoteTypesIndex: React.PropTypes.object.isRequired,

      // data
      student: React.PropTypes.object.isRequired,
      feed: React.PropTypes.object.isRequired,
      dibels: React.PropTypes.array.isRequired,
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
        discipline_incidents: React.PropTypes.array,
        tardies: React.PropTypes.array,
        absences: React.PropTypes.array
      }),

      access: React.PropTypes.object,

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
    selectedTabStyles: function(columnKey) {
      return (columnKey === this.props.selectedColumnKey) ? styles.selectedTab : {};
    },

    render: function() {
      return dom.div({ className: 'StudentProfilePage' },
        createEl(StudentProfileHeader, { student: this.props.student }),
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

    getNotesHelpContent: function(){
      return dom.div({},
        dom.p({}, 'The Notes tab is the place to keep notes about a student, whether it’s SST, MTSS, \
        a parent conversation, or some informal strategies that a teacher/team is using to help a student. \
        More formal strategies (e.g. the student meets with a tutor or counselor every week) should be recorded in Services.'),
        dom.br({}),
        dom.p({}, dom.b({}, 'Who can enter a note? '), 'Anyone who works with or involved with the student, \
        including classroom/ELL/SPED teachers, principals/assistant principals, counselors, and attendance officers.'),
        dom.br({}),
        dom.p({}, dom.b({}, 'What can/should I put in a note? '), 'The true test is to think about whether the information will help your \
        team down the road in supporting this student, either in the coming weeks, or a few years from now. Examples include:'),
        dom.br({}),
        dom.ul({},
          dom.li({}, '"Oscar just showed a 20 point increase in ORF. It seems like the take home readings are working (parents are very supportive) and we will continue it."'),
          dom.li({}, '"This is a follow-up MTSS meeting for Julie. Over the last 4 weeks, she is not showing many gains despite the volunteer tutor and the change in seating…."'),
          dom.li({}, '"Alex just got an M on the latest F&P. Will try having him go next door to join the other 4th grade group during guided reading."'),
          dom.li({}, '"Medicine change for Uri on 4/10. So far slight increase in focus."'),
          dom.li({}, '"51a filed on 3/21. Waiting determination and follow-up from DCF."'),
          dom.li({}, '"Just found that Cora really likes to go help out in grade 1. Best incentive yet for when she stays on task and completes work."'),
          dom.li({}, '"Arranged for Kevin to go to community schools 2x/week and to get extra homework help."'),
          dom.li({}, '"Julia will do an FBA and report back at the next SST meeting to determine sources of the behavior."'),
          dom.li({}, '"Mediation occurred between Oscar and Uri and went well. Both have agreed to keep distance for 2 weeks."'),
          dom.li({}, '"Parent called to report that Jill won art award and will be going to nationals. She suggested this might be an outlet if she shows frustration in schoolwork."')
        )
      )
    },

    renderSectionDetails: function() {
      switch (this.props.selectedColumnKey) {
        case 'profile': return createEl(ProfileDetails,
          {
            student: this.props.student,
            feed: this.props.feed,
            access: this.props.access,
            dibels: this.props.dibels,
            chartData: this.props.chartData,
            attendanceData: this.props.attendanceData,
            serviceTypesIndex: this.props.serviceTypesIndex
          }
        );
        case 'ela': return createEl(ELADetails, {chartData: this.props.chartData, student: this.props.student});
        case 'math': return createEl(MathDetails, {chartData: this.props.chartData, student: this.props.student});
        case 'attendance':
          var attendanceData = this.props.attendanceData;
          return createEl(AttendanceDetails, {
            disciplineIncidents: attendanceData.discipline_incidents,
            absences: attendanceData.absences,
            tardies: attendanceData.tardies,
            student: this.props.student,
            feed: this.props.feed,
            serviceTypesIndex: this.props.serviceTypesIndex
          });
        case 'interventions':
          return dom.div({ className: 'InterventionsDetails', style: {display: 'flex'} },
            createEl(NotesDetails, {
              student: this.props.student,
              eventNoteTypesIndex: this.props.eventNoteTypesIndex,
              educatorsIndex: this.props.educatorsIndex,
              currentEducator: this.props.currentEducator,
              feed: this.props.feed,
              actions: this.props.actions,
              requests: this.props.requests,

              showingRestrictedNotes: false,
              helpContent: this.getNotesHelpContent(),
              helpTitle: 'What is a Note?',
              title: 'Notes'
            }),
            createEl(ServicesDetails, {
              student: this.props.student,
              serviceTypesIndex: this.props.serviceTypesIndex,
              educatorsIndex: this.props.educatorsIndex,
              currentEducator: this.props.currentEducator,
              feed: this.props.feed,
              actions: this.props.actions,
              requests: this.props.requests
            })
          );
      }
      return null;
    },

    renderProfileColumn: function() {
      var student = this.props.student;
      var columnKey = 'profile';
      var demographicsElements = [
        'Disability: ' + (student.sped_level_of_need || 'None'),
        'Low income: ' + student.free_reduced_lunch,
        'Language: ' + student.limited_english_proficiency
      ];

      if (this.props.access) {
        demographicsElements.push('ACCESS Composite score: ' + this.props.access.composite);
      };

      return dom.div({ style: styles.columnContainer, onClick: this.onColumnClicked.bind(this, columnKey) },
        dom.div({ style: merge(styles.tab, this.selectedTabStyles(columnKey)) }, "Overview"),
        dom.div({
          style: merge(styles.column, styles.academicColumn, this.selectedColumnStyles(columnKey), styles.profileColumn)
        },
        createEl(SummaryList, {
          title: 'Demographics',
          elements: demographicsElements,
        })
      ));
    },

    renderInterventionsColumn: function() {
      var student = this.props.student;
      var columnKey = 'interventions';

      return dom.div({ style: styles.columnContainer, onClick: this.onColumnClicked.bind(this, columnKey) },
        dom.div({ style: merge(styles.tab, this.selectedTabStyles(columnKey)) }, "Interventions"),
        dom.div({
          className: 'interventions-column',
          style: merge(styles.column, styles.academicColumn, styles.interventionsColumn, this.selectedColumnStyles(columnKey))
        },
        this.padElements(styles.summaryWrapper, [
        this.renderPlacement(student),
        this.renderServices(student),
        this.renderStaff(student)
      ])));
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

    renderServices: function(student) {
      var activeServices = this.props.feed.services.active;
      if (activeServices.length === 0) {
        return createEl(SummaryList, {
          title: 'Services',
          elements: ['No services']
        });
      }

      var limit = 3;
      var sortedServices = _.sortBy(activeServices, 'date_started').reverse();
      var elements = sortedServices.slice(0, limit).map(function(service) {
        var serviceText = this.props.serviceTypesIndex[service.service_type_id].name;
        return dom.span({ key: service.id },
          dom.span({}, serviceText)
        );
      }, this);
      if (sortedServices.length > limit) elements.push(dom.div({}, '+ ' + (sortedServices.length - limit) + ' more'));

      return createEl(SummaryList, {
        title: 'Services',
        elements: elements
      });
    },

    renderStaff: function(student) {
      var activeServices = this.props.feed.services.active;
      var educatorNamesFromServices = _.pluck(activeServices, 'provided_by_educator_name');
      var uniqueNames = _.unique(educatorNamesFromServices);
      var nonEmptyNames = _.filter(uniqueNames, function(id) { return id !== "" && id !== null; });
      var educatorNames = _.isEmpty( nonEmptyNames ) ? ["No staff"] : nonEmptyNames;

      var limit = 3;

      var elements = educatorNames.slice(0, limit);

      if (educatorNames.length > limit) {
        elements.push(dom.span({}, '+ ' + (educatorNames.length - limit) + ' more'));
      } else if (educatorNames.length === 0) {
        elements.push(['None']);
      }

      return createEl(SummaryList, {
        title: 'Staff providing services',
        elements: educatorNames
      });
    },

    renderELAColumn: function() {
      var student = this.props.student;
      var chartData = this.props.chartData;
      var columnKey = 'ela';

      return dom.div({ style: styles.columnContainer, onClick: this.onColumnClicked.bind(this, columnKey) },
        dom.div({ style: merge(styles.tab, this.selectedTabStyles(columnKey)) }, "Reading"),
        dom.div({
          className: 'ela-background',
          style: merge(styles.column, styles.academicColumn, this.selectedColumnStyles(columnKey))
        },
        this.wrapSummary({
          caption: 'STAR Reading',
          value: student.most_recent_star_reading_percentile,
          sparkline: this.renderSparkline(chartData.star_series_reading_percentile || [])
        }),
        this.wrapSummary({
          caption: 'MCAS ELA Score',
          value: student.most_recent_mcas_ela_scaled,
          sparkline: this.renderSparkline(chartData.mcas_series_ela_scaled || [], {
            valueRange: Scales.mcas.valueRange,
            thresholdValue: Scales.mcas.threshold
          })
        }),
        this.renderMcasElaSgpOrDibels()
      ));
    },

    renderMcasElaSgpOrDibels: function () {
      var student = this.props.student;
      var chartData = this.props.chartData;
      var grade = student.grade;
      var dibels = _.sortBy(this.props.dibels, 'date_taken');

      var belowGradeFour = _.includes(['KF', 'PK', '1', '2', '3'], grade);
      var hasDibels = (dibels.length > 0);

      if (belowGradeFour && hasDibels) {
        var latestDibels = _.last(dibels).performance_level.toUpperCase();
        return dom.div({ style: styles.summaryWrapper },
          createEl(SummaryWithoutSparkline, { caption: 'DIBELS', value: latestDibels })
        );
      } else {
        return this.wrapSummary({
          caption: 'MCAS ELA SGP',
          value: student.most_recent_mcas_ela_growth,
          sparkline: this.renderSparkline(chartData.mcas_series_ela_growth || [])
        })
      }
    },

    renderMathColumn: function() {
      var student = this.props.student;
      var chartData = this.props.chartData;
      var columnKey = 'math';

      return dom.div({ style: styles.columnContainer, onClick: this.onColumnClicked.bind(this, columnKey)},
        dom.div({ style: merge(styles.tab, this.selectedTabStyles(columnKey)) }, "Math"),
        dom.div({
          className: 'math-background',
          style: merge(styles.column, styles.academicColumn, this.selectedColumnStyles(columnKey))
        },
        this.wrapSummary({
          caption: 'STAR Math',
          value: student.most_recent_star_math_percentile,
          sparkline: this.renderSparkline(chartData.star_series_math_percentile || [])
        }),
        this.wrapSummary({
          caption: 'MCAS Math Score',
          value: student.most_recent_mcas_math_scaled,
          sparkline: this.renderSparkline(chartData.mcas_series_math_scaled || [], {
            valueRange: Scales.mcas.valueRange,
            thresholdValue: Scales.mcas.threshold
          })
        }),
        this.wrapSummary({
          caption: 'MCAS Math SGP',
          value: student.most_recent_mcas_math_growth,
          sparkline: this.renderSparkline(chartData.mcas_series_math_growth || [])
        })
      ));
    },

    renderAttendanceColumn: function() {
      var student = this.props.student;
      var attendanceData = this.props.attendanceData;
      var columnKey = 'attendance';

      return dom.div({ style: styles.columnContainer, onClick: this.onColumnClicked.bind(this, columnKey) },
        dom.div({ style: merge(styles.tab, this.selectedTabStyles(columnKey)) }, "Attendance and Behavior"),
        dom.div({
          className: 'attendance-background',
          style: merge(styles.column, styles.academicColumn, this.selectedColumnStyles(columnKey))
      },
        this.renderAttendanceEventsSummary(
          student.discipline_incidents_count,
          attendanceData.discipline_incidents,
          Scales.disciplineIncidents.flexibleRange, {
            caption: 'Discipline this school year',
            thresholdValue: Scales.disciplineIncidents.threshold,
          }
        ),
        this.renderAttendanceEventsSummary(
          student.absences_count,
          attendanceData.absences,
          Scales.absences.flexibleRange, {
            caption: 'Absences this school year',
            thresholdValue: Scales.absences.threshold,
          }
        ),
        this.renderAttendanceEventsSummary(
          student.tardies_count,
          attendanceData.tardies,
          Scales.tardies.flexibleRange, {
            caption: 'Tardies this school year',
            thresholdValue: Scales.tardies.threshold,
          }
        )
      ));
    },

    renderAttendanceEventsSummary: function(count, events, flexibleRangeFn, props) {
      var cumulativeQuads = QuadConverter.cumulativeByMonthFromEvents(events);
      var valueRange = flexibleRangeFn(cumulativeQuads);
      var value = count;

      return this.wrapSummary(merge({
        title: props.title,
        value: value,
        sparkline: createEl(BarChartSparkline, merge({
          height: styles.sparklineHeight,
          width: styles.sparklineWidth,
          valueRange: valueRange,
          quads: cumulativeQuads,
          dateRange: this.dateRange(),
        }, props)),
      }, props));
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
