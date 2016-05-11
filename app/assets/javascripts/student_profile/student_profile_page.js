(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var Routes = window.shared.Routes;
  var PropTypes = window.shared.PropTypes;
  var Sparkline = window.shared.Sparkline;
  var AcademicSummary = window.shared.AcademicSummary;
  var SummaryWithoutSparkline = window.shared.SummaryWithoutSparkline;
  var AttendanceEventsSummary = window.shared.AttendanceEventsSummary;
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
    subtitle: {
      fontStyle: 'italic',
      width: '100%',
      textAlign: 'center',
    },
    sparklineWidth: 150,
    sparklineHeight: 50
  };


  var StudentProfilePage = window.shared.StudentProfilePage = React.createClass({
    displayName: 'StudentProfilePage',

    propTypes: {
      //context
      nowMomentFn: React.PropTypes.func.isRequired,
      currentEducator: React.PropTypes.object.isRequired,

      // constants
      interventionTypesIndex: React.PropTypes.object.isRequired,
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
        this.renderSaveStatus(),
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
        case 'ela': return createEl(ELADetails, {chartData: this.props.chartData});
        case 'math': return createEl(MathDetails, {chartData: this.props.chartData});
        case 'attendance':
          var attendanceData = this.props.attendanceData;
          return createEl(AttendanceDetails, {
            disciplineIncidents: attendanceData.discipline_incidents,
            absences: attendanceData.absences,
            tardies: attendanceData.tardies
          });
        case 'interventions':
          return createEl(InterventionsDetails, merge(_.pick(this.props,
            'currentEducator',
            'student',
            'feed',
            'interventionTypesIndex',
            'serviceTypesIndex',
            'eventNoteTypesIndex',
            'educatorsIndex',
            'actions',
            'requests'
          )));
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

      return dom.div({
        style: styles.columnContainer,
        onClick: this.onColumnClicked.bind(this, columnKey)
      }, dom.div({ style: merge(styles.tab, this.selectedTabStyles(columnKey)) }, "Overview"),
      dom.div({
        style: merge(styles.column, styles.academicColumn, this.selectedColumnStyles(columnKey), styles.profileColumn),
        onClick: this.onColumnClicked.bind(this, columnKey)
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

      return dom.div({
        style: styles.columnContainer,
        onClick: this.onColumnClicked.bind(this, columnKey)
      }, dom.div({
        style: merge(styles.tab, this.selectedTabStyles(columnKey))
      }, "Interventions"),
      dom.div({
        className: 'interventions-column',
        style: merge(styles.column, styles.academicColumn, styles.interventionsColumn, this.selectedColumnStyles(columnKey)),
        onClick: this.onColumnClicked.bind(this, columnKey)
      }, this.padElements(styles.summaryWrapper, [
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
      var nonNullNames = _.filter(uniqueNames, function(id) { return id !== null; });
      var educatorNames = _.isEmpty( nonNullNames ) ? ["No staff"] : nonNullNames;

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

      return dom.div({
        style: styles.columnContainer,
        onClick: this.onColumnClicked.bind(this, columnKey)
      },
      dom.div({
        style: merge(styles.tab, this.selectedTabStyles(columnKey))
      }, "Reading"),
      dom.div({
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

      return dom.div({
        style: styles.columnContainer,
        onClick: this.onColumnClicked.bind(this, columnKey)
      },
      dom.div({
        style: merge(styles.tab, this.selectedTabStyles(columnKey))
      }, "Math"),
      dom.div({
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

      return dom.div(
        {
          style: styles.columnContainer,
          onClick: this.onColumnClicked.bind(this, columnKey)
        },
        dom.div({ style: merge(styles.tab, this.selectedTabStyles(columnKey)) }, "Attendance and Behavior"),
        dom.div(
        {
          className: 'attendance-background',
          style: merge(styles.column, styles.academicColumn, this.selectedColumnStyles(columnKey)),
          onClick: this.onColumnClicked.bind(this, columnKey)
        },
        dom.div({ style: styles.subtitle }, "(this year)"),
        dom.br(),
        this.renderAttendanceEventsSummary(
          attendanceData.discipline_incidents, {caption: 'Discipline incidents'}
        ),
        dom.br(),
        dom.br(),
        this.renderAttendanceEventsSummary(
          attendanceData.absences, {caption: 'Absences'}
        ),
        dom.br(),
        dom.br(),
        this.renderAttendanceEventsSummary(
          attendanceData.tardies, {caption: 'Tardies'}
        )
      ));
    },

    // toSchoolYear: function(event){
    //   // Takes in an event, returns the start of the school year into which it falls.
    //   var d = moment(event.occurred_at);
    //   if (d.month() < 8){
    //     // The school year starts on August 1st.
    //     // So if the month is before August, it falls in the previous year.
    //     return d.year() - 1;
    //   } else {
    //     return d.year();
    //   }
    // },

    renderAttendanceEventsSummary: function(attendanceEvents, props){
      return dom.div(
        {style: merge(styles.summaryWrapper, {textAlign: 'center'})},
        createEl(AttendanceEventsSummary, merge(props, {
          attendanceEvents: attendanceEvents,
          caption: props.caption
        }))
      );
    },

    cumulativeCountQuads: function(attendanceEvents) {
      return QuadConverter.convertAttendanceEvents(attendanceEvents, this.props.nowMomentFn().toDate(), this.dateRange());
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
    }
  });
})();
