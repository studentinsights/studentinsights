import _ from 'lodash';
import moment from 'moment';
import StudentSectionsRoster from './student_sections_roster.jsx';

(function() {
  window.shared || (window.shared = {});
  const merge = window.shared.ReactHelpers.merge;
  const QuadConverter = window.shared.QuadConverter;
  const styles = window.shared.ProfileDetailsStyle;
  const Datepicker = window.shared.Datepicker;
  const filterFromDate = QuadConverter.firstDayOfSchool(QuadConverter.toSchoolYear(moment())-1);
  const filterToDate = moment();

  window.shared.ProfileDetails = React.createClass({
    displayName: 'ProfileDetails',

    propTypes: {
      student: React.PropTypes.object,
      feed: React.PropTypes.object,
      access: React.PropTypes.object,
      dibels: React.PropTypes.array,
      chartData: React.PropTypes.object,
      iepDocument: React.PropTypes.object,
      sections: React.PropTypes.array,
      currentEducatorAllowedSections: React.PropTypes.array,
      attendanceData: React.PropTypes.object,
      serviceTypesIndex: React.PropTypes.object,
      currentEducator: React.PropTypes.object,
    },

    getInitialState: function() {
      return {
        filterFromDate: QuadConverter.firstDayOfSchool(QuadConverter.toSchoolYear(moment())-1),
        filterToDate: moment()
      };
    },

    displayEventDate: function(event_date){
      // Use UTC to avoid timezone-related display errors. (See GitHub issue #622.)
      // Timezone is irrelevant for this UI. We are not displaying times, only dates.

      return moment(event_date).utc().format("MMMM Do, YYYY:");
    },

    getMessageForServiceType: function(service_type_id){
      // Given a service_type_id, returns a message suitable for human consumption describing the service.
      const lookup = this.props.serviceTypesIndex;

      return (lookup.hasOwnProperty(service_type_id))
        ? lookup[service_type_id].name
        : "Description not found for code: " + service_type_id;
    },

    getEvents: function(){
      // Returns a list of {type: ..., date: ..., value: ...} pairs, sorted by date of occurrence.
      const name = this.props.student.first_name;
      const events = [];

      _.each(this.props.attendanceData.tardies, function(obj){
        events.push({
          type: 'Tardy',
          id: obj.id,
          message: name + ' was tardy.',
          date: new Date(obj.occurred_at)
        });
      });
      _.each(this.props.attendanceData.absences, function(obj){
        events.push({
          type: 'Absence',
          id: obj.id,
          message: name + ' was absent.',
          date: new Date(obj.occurred_at)
        });
      });
      _.each(this.props.attendanceData.discipline_incidents, function(obj){
        events.push({
          type: 'Incident',
          id: obj.id,
          message: obj.incident_description + ' in the ' + obj.incident_location,
          date: new Date(obj.occurred_at)
        });
      });
      _.each(this.props.chartData.mcas_series_ela_scaled, function(quad){
        // var score = quad[3];
        events.push({
          type: 'MCAS-ELA',
          id: QuadConverter.toMoment(quad).format("MM-DD"),
          message: name + ' scored a ' + QuadConverter.toValue(quad) +' on the ELA section of the MCAS.',
          date: QuadConverter.toDate(quad)
        });
      });
      _.each(this.props.chartData.mcas_series_math_scaled, function(quad){
        // var score = quad[3];
        events.push({
          type: 'MCAS-Math',
          id: QuadConverter.toMoment(quad).format("MM-DD"),
          message: name + ' scored a ' + QuadConverter.toValue(quad) +' on the Math section of the MCAS.',
          date: QuadConverter.toDate(quad)
        });
      });
      _.each(this.props.chartData.star_series_reading_percentile, function(quad){
        // var score = quad[3];
        events.push({
          type: 'STAR-Reading',
          id: QuadConverter.toMoment(quad).format("MM-DD"),
          message: name + ' scored in the ' + QuadConverter.toValue(quad) +'th percentile on the Reading section of STAR.',
          date: QuadConverter.toDate(quad)
        });
      });
      _.each(this.props.chartData.star_series_math_percentile, function(quad){
        // var score = quad[3];
        events.push({
          type: 'STAR-Math',
          id: QuadConverter.toMoment(quad).format("MM-DD"),
          message: name + ' scored in the ' + QuadConverter.toValue(quad) +'th percentile on the Math section of STAR.',
          date: QuadConverter.toDate(quad)
        });
      });
      _.each(this.props.feed.deprecated.interventions, function(obj){
        events.push({
          type: 'Note',
          id: obj.id,
          message: obj.name + '(Goal: ' + obj.goal + ')',
          date: moment(obj.start_date_timestamp, "YYYY-MM-DD").toDate()
        });
      });
      _.each(this.props.feed.deprecated.notes, function(obj){
        events.push({
          type: 'Note',
          id: obj.id,
          message: obj.content,
          date: moment(obj.created_at_timestamp).toDate()
        });
      });
      _.each(this.props.feed.event_notes, function(obj){
        events.push({
          type: 'Note',
          id: obj.id,
          message: obj.text,
          date: moment(obj.recorded_at).toDate()
        });
      });

      const services = this.props.feed.services.active.concat(this.props.feed.services.discontinued);
      _.each(services, function(obj){
        events.push({
          type: 'Service',
          id: obj.id,
          message: this.getMessageForServiceType(obj.service_type_id),
          date: moment(obj.date_started).toDate()
        });
      }.bind(this));

      _.each(this.props.dibels, function(obj) {
        // TODO(kr) need to investigate further, whether this is local demo data or production
        // data quality issue
        if (obj.performance_level === null) return;

        const cleanedDate = obj.date_taken.split('T')[0];
        const parsedDate = moment.utc(cleanedDate, 'YYYY-MM-DD').toDate();

        events.push({
          type: 'DIBELS',
          id: obj.id,
          message: name + ' scored ' + obj.performance_level.toUpperCase() + ' in DIBELS.',
          date: parsedDate
        });
      });
      return _.sortBy(events, 'date').reverse();
    },

    onFilterFromDateChanged: function(dateText) {
      const textMoment = moment.utc(dateText, 'MM/DD/YYYY');
      const updatedMoment = (textMoment.isValid()) ? textMoment : null;
      this.filterFromDate = updatedMoment;
    },

    onFilterToDateChanged: function(dateText) {
      const textMoment = moment.utc(dateText, 'MM/DD/YYYY');
      const updatedMoment = (textMoment.isValid()) ? textMoment : null;
      this.filterToDate = updatedMoment;
    },

    onClickGenerateStudentReport: function(event) {
      const sections = $('#section:checked').map(function() {return this.value;}).get().join(',');
      window.location = this.props.student.id + '/student_report.pdf?sections=' + sections + '&from_date=' + filterFromDate.format('MM/DD/YYYY') + '&to_date=' + filterToDate.format('MM/DD/YYYY');
      return null;
    },

    render: function(){
      return (
        <div>
          <div style={{clear: 'both'}}>
            {this.renderSectionDetails()}
          </div>
          <div style={{display: 'flex'}}>
            {this.renderAccessDetails()}
            {this.renderStudentReportFilters()}
            {this.renderIepDocuments()}
          </div>
          <div style={{clear: 'both'}}>
            {this.renderFullCaseHistory()}
          </div>
        </div>
      );
    },

    renderSectionDetails: function() {
      const sections = this.props.sections;

      // If there are no sections, don't generate the student sections roster
      if (!sections || sections.length == 0) return null;

      // If this student is not a high school student, don't generate the student sections roster
      if (this.props.student.school_type != 'HS') return null;

      return (
        <div id="sections-roster" className="roster" style={styles.roundedBox}>
          <h4 style={styles.sectionsRosterTitle}>
            Sections
          </h4>
          <StudentSectionsRoster
            sections={this.props.sections}
            linkableSections={this.props.currentEducatorAllowedSections}
            />
        </div>

      );
    },

    renderAccessDetails: function () {
      const access = this.props.access;
      if (!access) return null;

      const access_result_rows = Object.keys(access).map(function(subject) {
        return (
          <tr key={subject}>
            <td style={styles.accessLeftTableCell}>
              {subject}
            </td>
            <td>
              {access[subject] || '—'}
            </td>
          </tr>
        );
      });

      return (
        <div style={_.merge(styles.column, {display: 'flex', flex: 1})}>
          <h4 style={styles.title}>
            ACCESS
          </h4>
          <table>
            <thead>
              <tr>
                <th style={styles.tableHeader}>
                  Subject
                </th>
                <th style={styles.tableHeader}>
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {access_result_rows}
            </tbody>
          </table>
          <div />
          <div style={styles.accessTableFootnote}>
            Most recent ACCESS scores shown.
          </div>
        </div>
      );
    },

    renderStudentReportSectionOption: function(optionValue, optionName) {
      return (
        <div style={styles.option3Column}>
          <input style={styles.optionCheckbox} type='checkbox' id='section' name={optionValue} defaultChecked value={optionValue} />
          <label style={styles.optionLabel}>{optionName}</label>
        </div>
      );
    },

    renderIepDocuments: function () {
      const iepDocument = this.props.iepDocument;
      if (!iepDocument) return null;

      const url = `/iep_documents/${iepDocument.id}`;

      return (
        <div style={_.merge(styles.column, {display: 'flex', flex: 1})}>
          <h4 style={styles.title}>Active IEP:</h4>
          <p style={{fontSize: 15}} key={iepDocument.id}>
            <a href={url}>
              Download {iepDocument.file_name}.
            </a>
          </p>
        </div>
      );
    },

    renderStudentReportFilters: function () {
      return (
        <div style={_.merge(styles.column, {display: 'flex', flex: 1})}>
          <h4 style={styles.title}>Student Report</h4>
          <span style={styles.tableHeader}>Select sections to include in report:</span>
          <div>
            {this.renderStudentReportSectionOption('notes','Notes')}
            {this.renderStudentReportSectionOption('services','Services')}
            {this.renderStudentReportSectionOption('attendance','Attendance')}
            {this.renderStudentReportSectionOption('discipline_incidents','Discipline Incidents')}
            {this.renderStudentReportSectionOption('assessments','Assessments')}
          </div>
          <span style={styles.tableHeader}>Select dates for the report:</span>
          <div>
            <div style={styles.option2Column}>
              <label>From date:</label>
              <Datepicker
                styles={{ input: styles.datepickerInput }}
                value={filterFromDate.format('MM/DD/YYYY')}
                onChange={this.onFilterFromDateChanged}
                datepickerOptions={{
                  showOn: 'both',
                  dateFormat: 'mm/dd/yy',
                  minDate: undefined
                }} />
            </div>
            <div style={styles.option2Column}>
              <label>To date:</label>
              <Datepicker
                styles={{ input: styles.datepickerInput }}
                value={filterToDate.format('MM/DD/YYYY')}
                onChange={this.onFilterToDateChanged}
                datepickerOptions={{
                  showOn: 'both',
                  dateFormat: 'mm/dd/yy',
                  minDate: undefined
                }} />
            </div>
          </div>
          <br/>
          <button
            style={styles.studentReportButton}
            className="btn btn-warning"
            onClick={this.onClickGenerateStudentReport}>
            Generate Student Report
          </button>
        </div>
      );
    },

    renderFullCaseHistory: function(){
      const bySchoolYearDescending = _.toArray(
        _.groupBy(this.getEvents(), function(event){ return QuadConverter.toSchoolYear(event.date); })
      ).reverse();

      return (
        <div id="full-case-history">
          <div className="ServicesHeader" style={styles.fullCaseHistoryHeading}>
            <h4 style={styles.fullCaseHistoryTitle}>
              Full Case History
            </h4>
          </div>
          {bySchoolYearDescending.map(this.renderCardsForYear)}
        </div>
      );
    },

    renderCardsForYear: function(eventsForYear){
      // Grab what school year we're in from any object in the list.
      const year = QuadConverter.toSchoolYear(eventsForYear[0].date);
      // Computes '2016 - 2017 School Year' for input 2016, etc.
      const schoolYearString = year.toString() + ' - ' + (year+1).toString() + ' School Year';

      const key = 'school-year-starting-' + year;
      return (
        <div style={styles.box} key={key} id={key}>
          <h4 style={styles.schoolYearTitle}>
            {schoolYearString}
          </h4>
          {eventsForYear.map(this.renderCard)}
        </div>
      );
    },

    renderCard: function(event){
      const key = [event.type, event.id].join("-");

      let containingDivStyle;
      let headerDivStyle;
      let paddingStyle;
      let text;

      if (event.type === 'Absence' || event.type === 'Tardy'){
        // These event types are less important, so make them smaller and no description text.
        containingDivStyle = styles.feedCard;
        headerDivStyle = merge(styles.feedCardHeader, {fontSize: 14});
        paddingStyle = {paddingLeft: 10};
        text = '';
      } else {
        containingDivStyle = merge(styles.feedCard, {border: '1px solid #eee'});
        headerDivStyle = styles.feedCardHeader;
        paddingStyle = {padding: 10};
        text = event.message;
      }

      const dateStyle = {display: 'inline-block', width: 180};

      const badgeStyle = merge(styles.badge, {background: styles.type_to_color[event.type]});

      return (
        <div key={key} id={key} style={containingDivStyle}>
          <div style={paddingStyle}>
            <div style={headerDivStyle}>
              <span style={dateStyle}>
                {this.displayEventDate(event.date)}
              </span>
              <span style={badgeStyle}>
                {event.type.replace("-", " ")}
              </span>
            </div>
            {text}
          </div>
        </div>
      );
    }

  });
})();
