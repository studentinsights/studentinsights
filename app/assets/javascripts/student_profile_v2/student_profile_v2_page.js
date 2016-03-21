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
      marginLeft: 20,
      marginRight: 20,
      width: '100%',
      maxWidth: 1100,
      height: 360
    },
    detailsContainer: {
      margin: 30
    },
    academicColumn: {
      textAlign: 'left',
      width: 220
    },
    profileColumn: {
      background: '#ededed'
    },
    interventionsColumn: {
      background: '#ededed'
    },
    column: {
      flex: 1,
      padding: '16px 25px 11px 25px',
      cursor: 'pointer',
      border: '1px solid #eee',
      height: '80%',
      margin: 0,
      border: '1px solid #ccc',
      borderRadius: '0 0 5px 5px',
    },
    columnContainer: {
      display: 'flex',
      flexDirection: 'column',
      margin: '0 3px 0 0',
      borderRadius: '0 0 5px 5px',
    },
    selectedColumn: {
      border: '5px solid #3177c9',
      borderTop: 0,
      padding: '17px 21px 11px 21px'
    },
    selectedTab: {
      background: '#3177c9',
      color: 'white',
      border: '1px solid #3177c9',
    },
    summaryWrapper: {
      paddingBottom: 10
    },
    tab: {
      fontWeight: 'bold',
      width: '100%',
      height: 40,
      borderRadius: '5px 5px 0 0',
      border: '1px solid #ccc',
      textAlign: 'center',
      padding: '10px 5px 5px 5px',
      margin: 0
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
      serviceTypesIndex: React.PropTypes.object.isRequired,

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
        discipline_incidents: React.PropTypes.array,
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
    selectedTabStyles: function(columnKey) {
      return (columnKey === this.props.selectedColumnKey) ? styles.selectedTab : {};
    },

    render: function() {
      return dom.div({ className: 'StudentProfileV2Page' },
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
            chartData: this.props.chartData,
            attendanceData: this.props.attendanceData,
            student: this.props.student
          }
        );
        case 'ela': return createEl(ELADetails, {chartData: this.props.chartData});
        case 'math': return createEl(MathDetails, {chartData: this.props.chartData});
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
            'feed',
            'interventionTypesIndex',
            'serviceTypesIndex',
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

      return dom.div({ style: styles.columnContainer, onClick: this.onColumnClicked.bind(this, columnKey) }, dom.div({ style: merge(styles.tab, this.selectedTabStyles(columnKey)) }, "Overview"),
      dom.div({
        style: merge(styles.column, styles.academicColumn, this.selectedColumnStyles(columnKey), styles.profileColumn),
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
      ));
    },

    renderInterventionsColumn: function() {
      var student = this.props.student;
      var columnKey = 'interventions';

      return dom.div({ style: styles.columnContainer, onClick: this.onColumnClicked.bind(this, columnKey) }, dom.div({ style: merge(styles.tab, this.selectedTabStyles(columnKey)) }, "Interventions"),
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
      var services = this.props.feed.services;
      if (services.length === 0) {
        return createEl(SummaryList, {
          title: 'Services',
          elements: ['No services']
        });
      }

      var limit = 3;
      var sortedServices = _.sortBy(services, 'date_started').reverse();
      var elements = sortedServices.slice(0, limit).map(function(service) {
        var serviceText = this.props.serviceTypesIndex[service.service_type_id].name;
        var daysText = moment.utc(service.date_started).from(this.props.nowMomentFn(), true);
        return dom.span({ key: service.id },
          dom.span({}, serviceText),
          dom.span({ style: { opacity: 0.25, paddingLeft: 10 } }, daysText)
        );
      }, this);
      if (sortedServices.length > limit) elements.push(dom.div({}, '+ ' + (sortedServices.length - limit) + ' more'));

      return createEl(SummaryList, {
        title: 'Services',
        elements: elements
      });
    },

    renderStaff: function(student) {
      var limit = 3;
      var educatorIds = FeedHelpers.allEducatorIds(this.props.feed);
      var elements = educatorIds.slice(0, limit).map(function(educatorId) {
        return createEl(Educator, { educator: this.props.educatorsIndex[educatorId] });
      }, this);

      if (educatorIds.length > limit) {
        elements.push(dom.span({}, '+ ' + (educatorIds.length - limit) + ' more'));
      } else if (educatorIds.length === 0) {
        elements.push(['None']);
      }

      return createEl(SummaryList, {
        title: 'Support staff',
        elements: elements
      });
    },

    renderELAColumn: function() {
      var student = this.props.student;
      var chartData = this.props.chartData;
      var columnKey = 'ela';

      return dom.div({ style: styles.columnContainer, onClick: this.onColumnClicked.bind(this, columnKey) }, dom.div({ style: merge(styles.tab, this.selectedTabStyles(columnKey)) }, "Reading"),
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
      ));
    },

    renderMathColumn: function() {
      var student = this.props.student;
      var chartData = this.props.chartData;
      var columnKey = 'math';

      return dom.div({ style: styles.columnContainer, onClick: this.onColumnClicked.bind(this, columnKey)}, dom.div({ style: merge(styles.tab, this.selectedTabStyles(columnKey)) }, "Math"),
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
      ));
    },

    renderAttendanceColumn: function() {
      var student = this.props.student;
      var attendanceData = this.props.attendanceData;
      var columnKey = 'attendance';

      return dom.div({ style: styles.columnContainer, onClick: this.onColumnClicked.bind(this, columnKey) }, dom.div({ style: merge(styles.tab, this.selectedTabStyles(columnKey)) }, "Attendance and Behavior"),
        dom.div({
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
      ));
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
    },

    renderTitle: function(text) {
      return dom.div({style: {fontWeight: "bold"} }, text);
    }
  });
})();
