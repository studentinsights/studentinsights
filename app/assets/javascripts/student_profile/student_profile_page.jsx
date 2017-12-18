import _ from 'lodash';
import PropTypes from '../helpers/prop_types.jsx';
import {merge} from '../helpers/react_helpers.jsx';
import NotesDetails from '../student_profile/NotesDetails.js';

(function() {
  window.shared || (window.shared = {});

  const BarChartSparkline = window.shared.BarChartSparkline;
  const Sparkline = window.shared.Sparkline;
  const AcademicSummary = window.shared.AcademicSummary;
  const SummaryWithoutSparkline = window.shared.SummaryWithoutSparkline;
  const SummaryList = window.shared.SummaryList;
  const QuadConverter = window.shared.QuadConverter;
  const Scales = window.shared.Scales;

  const StudentProfileHeader = window.shared.StudentProfileHeader;
  const ProfileDetails = window.shared.ProfileDetails;
  const ELADetails = window.shared.ELADetails;
  const MathDetails = window.shared.MathDetails;
  const AttendanceDetails = window.shared.AttendanceDetails;
  const ServicesDetails = window.shared.ServicesDetails;


  // define page component
  const styles = {
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
    spedTitle: {
      fontWeight: 'bold',
      fontColor: 'black'
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

  window.shared.StudentProfilePage = React.createClass({
    displayName: 'StudentProfilePage',

    propTypes: {
      // UI
      selectedColumnKey: React.PropTypes.string.isRequired,

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
      iepDocument: React.PropTypes.object,
      sections: React.PropTypes.array,
      currentEducatorAllowedSections: React.PropTypes.array,

      // flux-y bits
      requests: PropTypes.requests,
      actions: PropTypes.actions
    },

    dateRange: function() {
      const nowMoment = this.props.nowMomentFn();
      return [nowMoment.clone().subtract(2, 'year').toDate(), nowMoment.toDate()];
    },

    selectedColumnStyles: function(columnKey) {
      return (columnKey === this.props.selectedColumnKey) ? styles.selectedColumn : {};
    },

    selectedTabStyles: function(columnKey) {
      return (columnKey === this.props.selectedColumnKey) ? styles.selectedTab : {};
    },

    onColumnClicked: function(columnKey) {
      this.props.actions.onColumnClicked(columnKey);
    },

    render: function() {
      return (
        <div className="StudentProfilePage">
          <StudentProfileHeader student={this.props.student} />
          <div className="summary-container" style={styles.summaryContainer}>
            {this.renderProfileColumn()}
            {this.renderELAColumn()}
            {this.renderMathColumn()}
            {this.renderAttendanceColumn()}
            {this.renderInterventionsColumn()}
          </div>
          <div style={styles.detailsContainer}>
            {this.renderSectionDetails()}
          </div>
        </div>
      );
    },

    renderNotesHelpContent: function(){
      return (
        <div>
          <p>
            The Notes tab is the place to keep notes about a student, whether it’s SST, MTSS,         a parent conversation, or some informal strategies that a teacher/team is using to help a student.         More formal strategies (e.g. the student meets with a tutor or counselor every week) should be recorded in Services.
          </p>
          <br />
          <p>
            <b>
              {'Who can enter a note? '}
            </b>
            Anyone who works with or involved with the student,         including classroom/ELL/SPED teachers, principals/assistant principals, counselors, and attendance officers.
          </p>
          <br/>
          <p>
            <b>
              {'What can/should I put in a note? '}
            </b>
            The true test is to think about whether the information will help your         team down the road in supporting this student, either in the coming weeks, or a few years from now. Examples include:
          </p>
          <br/>
          <ul>
            <li>
              "Oscar just showed a 20 point increase in ORF. It seems like the take home readings are working (parents are very supportive) and we will continue it."
            </li>
            <li>
              "This is a follow-up MTSS meeting for Julie. Over the last 4 weeks, she is not showing many gains despite the volunteer tutor and the change in seating…."
            </li>
            <li>
              "Alex just got an M on the latest F&P. Will try having him go next door to join the other 4th grade group during guided reading."
            </li>
            <li>
              "Medicine change for Uri on 4/10. So far slight increase in focus."
            </li>
            <li>
              "51a filed on 3/21. Waiting determination and follow-up from DCF."
            </li>
            <li>
              "Just found that Cora really likes to go help out in grade 1. Best incentive yet for when she stays on task and completes work."
            </li>
            <li>
              "Arranged for Kevin to go to community schools 2x/week and to get extra homework help."
            </li>
            <li>
              "Julia will do an FBA and report back at the next SST meeting to determine sources of the behavior."
            </li>
            <li>
              "Mediation occurred between Oscar and Uri and went well. Both have agreed to keep distance for 2 weeks."
            </li>
            <li>
              "Parent called to report that Jill won art award and will be going to nationals. She suggested this might be an outlet if she shows frustration in schoolwork."
            </li>
          </ul>
        </div>
      );
    },

    renderSectionDetails: function() {
      switch (this.props.selectedColumnKey) {
      case 'profile': return (
          <ProfileDetails
            student={this.props.student}
            feed={this.props.feed}
            access={this.props.access}
            dibels={this.props.dibels}
            chartData={this.props.chartData}
            iepDocument={this.props.iepDocument}
            sections={this.props.sections}
            currentEducatorAllowedSections={this.props.currentEducatorAllowedSections}
            attendanceData={this.props.attendanceData}
            serviceTypesIndex={this.props.serviceTypesIndex}
            currentEducator={this.props.currentEducator}/>
      );
      case 'ela': return <ELADetails chartData={this.props.chartData} student={this.props.student} />;
      case 'math': return <MathDetails chartData={this.props.chartData} student={this.props.student} />;
      case 'attendance':
        return (
            <AttendanceDetails
              disciplineIncidents={this.props.attendanceData.discipline_incidents}
              absences={this.props.attendanceData.absences}
              tardies={this.props.attendanceData.tardies}
              student={this.props.student}
              feed={this.props.feed}
              serviceTypesIndex={this.props.serviceTypesIndex} />
        );
      case 'interventions':
        return (
            <div className="InterventionsDetails" style={{display: 'flex'}}>
              <NotesDetails
                student={this.props.student}
                eventNoteTypesIndex={this.props.eventNoteTypesIndex}
                educatorsIndex={this.props.educatorsIndex}
                currentEducator={this.props.currentEducator}
                feed={this.props.feed}
                actions={this.props.actions}
                requests={this.props.requests}
                showingRestrictedNotes={false}
                helpContent={this.renderNotesHelpContent()}
                helpTitle="What is a Note?"
                title="Notes" />
              <ServicesDetails
                student={this.props.student}
                serviceTypesIndex={this.props.serviceTypesIndex}
                educatorsIndex={this.props.educatorsIndex}
                currentEducator={this.props.currentEducator}
                feed={this.props.feed}
                actions={this.props.actions}
                requests={this.props.requests} />
            </div>
        );
      }
      return null;
    },

    renderProfileColumn: function() {
      const student = this.props.student;
      const access = this.props.access;
      const sections = this.props.sections;
      const columnKey = 'profile';

      const profileElements = [this.renderDemographics(student, access)];

      if(student.school_type == 'HS') {
        profileElements.push(this.renderSections(sections));
      }


      return (
        <div
          style={styles.columnContainer}
          onClick={this.onColumnClicked.bind(this, columnKey)}>
          <div style={merge(styles.tab, this.selectedTabStyles(columnKey))}>
            Overview
          </div>
          <div
            style={merge(styles.column, styles.academicColumn, this.selectedColumnStyles(columnKey), styles.profileColumn)}>
            {this.renderPaddedElements(styles.summaryWrapper, profileElements)}
          </div>
        </div>
      );
    },

    renderInterventionsColumn: function() {
      const student = this.props.student;
      const columnKey = 'interventions';

      return (
        <div
          style={styles.columnContainer}
          onClick={this.onColumnClicked.bind(this, columnKey)}>
          <div style={merge(styles.tab, this.selectedTabStyles(columnKey))}>
            Interventions
          </div>
          <div
            className="interventions-column"
            style={merge(styles.column, styles.academicColumn, styles.interventionsColumn, this.selectedColumnStyles(columnKey))}>
            {this.renderPaddedElements(styles.summaryWrapper, [
              this.renderPlacement(student),
              this.renderServices(student),
              this.renderStaff(student),
              this.renderSped(student)
            ])}
          </div>
        </div>
      );
    },

    renderDemographics: function(student, access) {
      const demographicsElements = [
        'Disability: ' + (student.sped_level_of_need || 'None'),
        'Language: ' + student.limited_english_proficiency
      ];

      if (access) {
        demographicsElements.push('ACCESS Composite score: ' + access.composite);
      }

      return (
        <SummaryList title="Demographics" elements={demographicsElements} />
      );


    },

    renderSections: function(sections) {
      const sectionCount = sections.length;
      const sectionText = sectionCount == 1 ? `${sectionCount} section` : `${sectionCount} sections`;

      return (
        <SummaryList title="Sections" elements={[sectionText]} />
      );
    },

    renderPlacement: function(student) {
      const placement = (student.sped_placement !== null)
        ? student.program_assigned + ', ' + student.sped_placement
        : student.program_assigned;

      const homeroom_name = student.homeroom_name;

      const homeroom = (homeroom_name)
        ? 'Homeroom ' + homeroom_name
        : 'No homeroom';

      return (
        <SummaryList
          title="Placement"
          elements={[ placement, homeroom ]}
        />
      );
    },

    renderServices: function(student) {
      const activeServices = this.props.feed.services.active;
      if (activeServices.length === 0) {
        return <SummaryList title="Services" elements={['No services']} />;
      }

      const limit = 3;
      const sortedServices = _.sortBy(activeServices, 'date_started').reverse();
      let elements = sortedServices.slice(0, limit).map(function(service) {
        const serviceText = this.props.serviceTypesIndex[service.service_type_id].name;
        return (
          <span key={service.id}>
            <span>
              {serviceText}
            </span>
          </span>
        );
      }, this);
      if (sortedServices.length > limit) elements.push(<div>
        {'+ ' + (sortedServices.length - limit) + ' more'}
      </div>);

      return <SummaryList title="Services" elements={elements} />;
    },

    renderStaff: function(student) {
      const activeServices = this.props.feed.services.active;
      const educatorNamesFromServices = _.map(activeServices, 'provided_by_educator_name');
      const uniqueNames = _.unique(educatorNamesFromServices);
      const nonEmptyNames = _.filter(uniqueNames, function(id) { return id !== "" && id !== null; });
      const educatorNames = _.isEmpty( nonEmptyNames ) ? ["No staff"] : nonEmptyNames;

      const limit = 3;

      const elements = educatorNames.slice(0, limit);

      if (educatorNames.length > limit) {
        elements.push(<span>
          {'+ ' + (educatorNames.length - limit) + ' more'}
        </span>);
      } else if (educatorNames.length === 0) {
        elements.push(['None']);
      }

      return <SummaryList title="Staff providing services" elements={educatorNames} />;
    },

    renderSped: function(student) {
      return (
        <div>
          <span style={styles.spedTitle}>
            SpEd services
          </span>
          <ul>
            <li>
              {this.renderSpedLevelText(student)}
            </li>
          </ul>
        </div>
      );
    },

    renderSpedLevelText: function(student) {
      switch (student.sped_level_of_need) {
      case "Low < 2": return "less than 2 hours / week";
      case "Low >= 2": return "2-5 hours / week";
      case "Moderate": return "6-14 hours / week";
      case "High": return "15+ hours / week";
      default: return "None";
      }
    },

    renderELAColumn: function() {
      const student = this.props.student;
      const chartData = this.props.chartData;
      const columnKey = 'ela';

      return (
        <div
          style={styles.columnContainer}
          onClick={this.onColumnClicked.bind(this, columnKey)}>
          <div style={merge(styles.tab, this.selectedTabStyles(columnKey))}>
            Reading
          </div>
          <div
            className="ela-background"
            style={merge(styles.column, styles.academicColumn, this.selectedColumnStyles(columnKey))}>
            {this.renderWrappedSummary({
              caption: 'STAR Reading',
              value: student.most_recent_star_reading_percentile,
              sparkline: this.renderSparkline(chartData.star_series_reading_percentile || [])
            })}
            {this.renderWrappedSummary({
              caption: 'MCAS ELA Score',
              value: student.most_recent_mcas_ela_scaled,
              sparkline: this.renderSparkline(chartData.mcas_series_ela_scaled || [], {
                valueRange: Scales.mcas.valueRange,
                thresholdValue: Scales.mcas.threshold
              })
            })}
            {this.renderMcasElaSgpOrDibels()}
          </div>
        </div>
      );
    },

    renderMcasElaSgpOrDibels: function () {
      const student = this.props.student;
      const chartData = this.props.chartData;
      const grade = student.grade;
      const dibels = _.sortBy(this.props.dibels, 'date_taken');

      const belowGradeFour = _.includes(['KF', 'PK', '1', '2', '3'], grade);
      const hasDibels = (dibels.length > 0);

      if (belowGradeFour && hasDibels) {
        const latestDibels = _.last(dibels).performance_level.toUpperCase();
        return (
          <div style={styles.summaryWrapper}>
            <SummaryWithoutSparkline caption="DIBELS" value={latestDibels} />
          </div>
        );
      } else {
        return this.renderWrappedSummary({
          caption: 'MCAS ELA SGP',
          value: student.most_recent_mcas_ela_growth,
          sparkline: this.renderSparkline(chartData.mcas_series_ela_growth || [])
        });
      }
    },

    renderMathColumn: function() {
      const student = this.props.student;
      const chartData = this.props.chartData;
      const columnKey = 'math';

      return (
        <div
          style={styles.columnContainer}
          onClick={this.onColumnClicked.bind(this, columnKey)}>
          <div style={merge(styles.tab, this.selectedTabStyles(columnKey))}>
            Math
          </div>
          <div
            className="math-background"
            style={merge(styles.column, styles.academicColumn, this.selectedColumnStyles(columnKey))}>
            {this.renderWrappedSummary({
              caption: 'STAR Math',
              value: student.most_recent_star_math_percentile,
              sparkline: this.renderSparkline(chartData.star_series_math_percentile || [])
            })}
            {this.renderWrappedSummary({
              caption: 'MCAS Math Score',
              value: student.most_recent_mcas_math_scaled,
              sparkline: this.renderSparkline(chartData.mcas_series_math_scaled || [], {
                valueRange: Scales.mcas.valueRange,
                thresholdValue: Scales.mcas.threshold
              })
            })}
            {this.renderWrappedSummary({
              caption: 'MCAS Math SGP',
              value: student.most_recent_mcas_math_growth,
              sparkline: this.renderSparkline(chartData.mcas_series_math_growth || [])
            })}
          </div>
        </div>
      );
    },

    renderAttendanceColumn: function() {
      const student = this.props.student;
      const attendanceData = this.props.attendanceData;
      const columnKey = 'attendance';

      return (
        <div
          style={styles.columnContainer}
          onClick={this.onColumnClicked.bind(this, columnKey)}>
          <div style={merge(styles.tab, this.selectedTabStyles(columnKey))}>
            Attendance and Behavior
          </div>
          <div
            className="attendance-background"
            style={merge(styles.column, styles.academicColumn, this.selectedColumnStyles(columnKey))}>
            {this.renderAttendanceEventsSummary(
              student.discipline_incidents_count,
              attendanceData.discipline_incidents,
              Scales.disciplineIncidents.flexibleRange, {
                caption: 'Discipline this school year',
                thresholdValue: Scales.disciplineIncidents.threshold,
              }
            )}
            {this.renderAttendanceEventsSummary(
              student.absences_count,
              attendanceData.absences,
              Scales.absences.flexibleRange, {
                caption: 'Absences this school year',
                thresholdValue: Scales.absences.threshold,
              }
            )}
            {this.renderAttendanceEventsSummary(
              student.tardies_count,
              attendanceData.tardies,
              Scales.tardies.flexibleRange, {
                caption: 'Tardies this school year',
                thresholdValue: Scales.tardies.threshold,
              }
            )}
          </div>
        </div>
      );
    },

    renderAttendanceEventsSummary: function(count, events, flexibleRangeFn, props) {
      const cumulativeQuads = QuadConverter.cumulativeByMonthFromEvents(events);
      const valueRange = flexibleRangeFn(cumulativeQuads);
      const value = count;

      return this.renderWrappedSummary(merge({
        title: props.title,
        value: value,
        sparkline: <BarChartSparkline
          {...merge({
            height: styles.sparklineHeight,
            width: styles.sparklineWidth,
            valueRange: valueRange,
            quads: cumulativeQuads,
            dateRange: this.dateRange(),
          }, props)} />,
      }, props));
    },

    // quads format is: [[year, month (Ruby), day, value]]
    renderSparkline: function(quads, props) {
      return (
        <Sparkline
          {...merge({
            height: styles.sparklineHeight,
            width: styles.sparklineWidth,
            quads: quads,
            dateRange: this.dateRange(),
            valueRange: [0, 100],
            thresholdValue: 50
          }, props || {})} />
      );
    },

    // render with style wrapper
    renderWrappedSummary: function(props) {
      return (
        <div style={styles.summaryWrapper}>
          <AcademicSummary {...props} />
        </div>
      );
    },

    renderPaddedElements: function(style, elements) {
      return (
        <div>
          {elements.map(function(element, index) {
            return (
              <div key={index} style={style}>
                {element}
              </div>
            );
          })}
        </div>
      );
    },

    renderTitle: function(text) {
      return (
        <div style={{fontWeight: "bold"}}>
          {text}
        </div>
      );
    }

  });
})();
