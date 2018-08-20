import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import {
  toSchoolYear,
  firstDayOfSchool
} from '../helpers/schoolYear';
import {
  toMoment,
  toValue,
  toDate
} from './QuadConverter';
import StudentSectionsRoster from './StudentSectionsRoster';
import { toMomentFromTimestamp } from '../helpers/toMoment';
import ProfilePdfDialog from './ProfilePdfDialog';
import FullCaseHistory from './FullCaseHistory';


export default class ProfileDetails extends React.Component {
  constructor(props) {
    super(props);
    const nowMoment = props.nowMoment || moment();
    this.state = {
      filterFromDate: firstDayOfSchool(toSchoolYear(nowMoment)-1),
      filterToDate: nowMoment
    };

    this.checkboxContainerEl = null;
    this.onFilterFromDateChanged = this.onFilterFromDateChanged.bind(this);
    this.onFilterToDateChanged = this.onFilterToDateChanged.bind(this);
    this.onClickGenerateStudentReport = this.onClickGenerateStudentReport.bind(this);
  }

  displayEventDate(event_date){
    // Use UTC to avoid timezone-related display errors. (See GitHub issue #622.)
    // Timezone is irrelevant for this UI. We are not displaying times, only dates.

    return moment(event_date).utc().format("MMMM Do, YYYY:");
  }

  getMessageForServiceType(service_type_id){
    // Given a service_type_id, returns a message suitable for human consumption describing the service.
    const lookup = this.props.serviceTypesIndex;

    return (lookup.hasOwnProperty(service_type_id))
      ? lookup[service_type_id].name
      : "Description not found for code: " + service_type_id;
  }

  getEvents() {
    // Returns a list of {type: ..., date: ..., value: ...} pairs, sorted by date of occurrence.
    const name = this.props.student.first_name;
    const events = [];

    _.each(this.props.attendanceData.tardies, obj => {
      events.push({
        type: 'Tardy',
        id: obj.id,
        message: name + ' was tardy.',
        date: new Date(obj.occurred_at)
      });
    });
    _.each(this.props.attendanceData.absences, obj => {
      events.push({
        type: 'Absence',
        id: obj.id,
        message: name + ' was absent.',
        date: new Date(obj.occurred_at)
      });
    });
    _.each(this.props.attendanceData.discipline_incidents, obj => {
      events.push({
        type: 'Incident',
        id: obj.id,
        message: obj.incident_description + ' in the ' + obj.incident_location,
        date: new Date(obj.occurred_at)
      });
    });
    _.each(this.props.chartData.mcas_series_ela_scaled, quad => {
      // var score = quad[3];
      events.push({
        type: 'MCAS-ELA',
        id: toMoment(quad).format("MM-DD"),
        message: name + ' scored a ' + toValue(quad) +' on the ELA section of the MCAS.',
        date: toDate(quad)
      });
    });
    _.each(this.props.chartData.mcas_series_math_scaled, quad => {
      // var score = quad[3];
      events.push({
        type: 'MCAS-Math',
        id: toMoment(quad).format("MM-DD"),
        message: name + ' scored a ' + toValue(quad) +' on the Math section of the MCAS.',
        date: toDate(quad)
      });
    });
    _.each(this.props.chartData.star_series_reading_percentile, starObject => {
      const dateTaken = toMomentFromTimestamp(starObject.date_taken);

      events.push({
        type: 'STAR-Reading',
        id: dateTaken.format(),
        message: `${name} scored in the ${starObject.percentile_rank}th percentile on the Reading section of STAR at ${dateTaken.local().format('h:mma')}.`,
        date: dateTaken.toDate()
      });
    });
    _.each(this.props.chartData.star_series_math_percentile, starObject => {
      const dateTaken = toMomentFromTimestamp(starObject.date_taken);

      events.push({
        type: 'STAR-Math',
        id: dateTaken.format(),
        message: `${name} scored in the ${starObject.percentile_rank}th percentile on the Math section of STAR at ${dateTaken.local().format('h:mma')}.`,
        date: dateTaken.toDate()
      });
    });
    _.each(this.props.feed.deprecated.interventions, obj => {
      events.push({
        type: 'Note',
        id: obj.id,
        message: obj.name + '(Goal: ' + obj.goal + ')',
        date: moment(obj.start_date_timestamp, "YYYY-MM-DD").toDate()
      });
    });
    _.each(this.props.feed.deprecated.notes, obj => {
      events.push({
        type: 'Note',
        id: obj.id,
        message: obj.content,
        date: moment(obj.created_at_timestamp).toDate()
      });
    });
    _.each(this.props.feed.event_notes, obj => {
      events.push({
        type: 'Note',
        id: obj.id,
        message: obj.text,
        date: moment(obj.recorded_at).toDate()
      });
    });

    const services = this.props.feed.services.active.concat(this.props.feed.services.discontinued);
    _.each(services, obj => {
      events.push({
        type: 'Service',
        id: obj.id,
        message: this.getMessageForServiceType(obj.service_type_id),
        date: moment(obj.date_started).toDate()
      });
    });

    _.each(this.props.dibels, obj => {
      const cleanedDate = obj.date_taken.split('T')[0];
      const parsedDate = moment.utc(cleanedDate, 'YYYY-MM-DD').toDate();

      events.push({
        type: 'DIBELS',
        id: obj.id,
        message: `${name} scored ${obj.benchmark} in DIBELS.`,
        date: parsedDate
      });
    });
    return _.sortBy(events, 'date').reverse();
  }

  filterFromDateForQuery() {
    const {filterFromDate} = this.state;

    return filterFromDate.format('MM/DD/YYYY');
  }

  filterToDateForQuery() {
    const {filterToDate} = this.state;

    return filterToDate.format('MM/DD/YYYY');
  }

  studentReportURL() {
    const id = this.props.student.id;
    const filterFromDateForQuery = this.filterFromDateForQuery();
    const filterToDateForQuery = this.filterToDateForQuery();
    const checkboxEls = $(this.checkboxContainerEl).find('.ProfileDetails-section').toArray();
    const sections = checkboxEls.filter(el => el.checked).map(el => el.value).join(',');

    return `/students/${id}/student_report.pdf?sections=${sections}&from_date=${filterFromDateForQuery}&to_date=${filterToDateForQuery}`;
  }

  onFilterFromDateChanged(dateText) {
    const textMoment = moment.utc(dateText, 'MM/DD/YYYY');
    const updatedMoment = (textMoment.isValid()) ? textMoment : null;
    this.setState({ filterFromDate: updatedMoment });
  }

  onFilterToDateChanged(dateText) {
    const textMoment = moment.utc(dateText, 'MM/DD/YYYY');
    const updatedMoment = (textMoment.isValid()) ? textMoment : null;
    this.setState({ filterToDate: updatedMoment });
  }

  onClickGenerateStudentReport(event) {
    window.location = this.studentReportURL();
    return null;
  }

  render(){
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
  }

  renderSectionDetails() {
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
  }

  renderAccessDetails() {
    const access = this.props.access;
    if (!access) return null;

    const access_result_rows = Object.keys(access).map(subject => {
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
      <div style={{...styles.column, display: 'flex', flex: 1}}>
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
  }

  renderIepDocuments() {
    const iepDocument = this.props.iepDocument;
    if (!iepDocument) return null;

    const url = `/iep_documents/${iepDocument.id}`;

    return (
      <div style={{...styles.column, display: 'flex', flex: 1}}>
        <h4 style={styles.title}>Active IEP:</h4>
        <p style={{fontSize: 15}} key={iepDocument.id}>
          <a href={url}>
            Download {iepDocument.file_name}.
          </a>
        </p>
      </div>
    );
  }

  renderStudentReportFilters() {
    const {student} = this.props;
    return (
      <ProfilePdfDialog
        showTitle={true}
        studentId={student.id}
        style={{...styles.column, flex: 1}}
      />
    );
  }

  renderFullCaseHistory(){
    const {student, feed, chartData, dibels, attendanceData, serviceTypesIndex} = this.props;
    return (
      <FullCaseHistory
        showTitle={true}
        student={student}
        feed={feed}
        dibels={dibels}
        chartData={chartData}
        attendanceData={attendanceData}
        serviceTypesIndex={serviceTypesIndex}
      />
    );
  }
}
ProfileDetails.propTypes = {
  student: PropTypes.object,
  feed: PropTypes.object,
  access: PropTypes.object,
  dibels: PropTypes.array,
  chartData: PropTypes.object,
  iepDocument: PropTypes.object,
  sections: PropTypes.array,
  currentEducatorAllowedSections: PropTypes.array,
  attendanceData: PropTypes.object,
  serviceTypesIndex: PropTypes.object,
  currentEducator: PropTypes.object,
  nowMoment: PropTypes.object
};

const styles = {
  feedCard: {
    marginBottom: 10,
    borderRadius: 10,
    fontSize: 14
  },
  feedCardHeader: {
    fontSize: 17,
    fontWeight: 400,
    color: '#555555'
  },
  box: {
    border: '1px solid #ccc',
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
  },
  roundedBox: {
    border: '1px solid #ccc',
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    borderRadius: 5,
  },
  header: {
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'space-between'
  },
  title: {
    borderBottom: '1px solid #333',
    color: 'black',
    padding: 10,
    paddingLeft: 0,
    marginBottom: 10
  },
  schoolYearTitle: {
    padding: 10,
    paddingLeft: 10,
    marginBottom: 10,
    color: '#555555'
  },
  badge: {
    display: 'inline-block',
    width: '10em',
    textAlign: 'center',
    marginLeft: 10,
    marginRight: 10
  },
  tableHeader: {
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10
  },
  accessLeftTableCell: {
    paddingRight: 25
  },
  accessTableFootnote: {
    fontStyle: 'italic',
    fontSize: 13,
    marginTop: 15,
    marginBottom: 20
  },
  fullCaseHistoryTitle: {
    color: 'black',
    display: 'inline-block',
    flex: 'auto',
  },
  sectionsRosterTitle: {
    color: 'black',
    display: 'inline-block',
    flex: 'auto',
  },
  fullCaseHistoryHeading: {
    display: 'flex',
    borderBottom: '1px solid #333',
    padding: 10,
    paddingLeft: 0,
  },
  type_to_color: {
    "Absence": '#e8fce8',
    "Tardy": '#e8fce8',
    "Incident": '#e8fce8',
    "Note": '#e8fce8',
    "Service": '#e8fce8',

    "MCAS-ELA": '#ffe7d6',
    "STAR-Reading": '#ffe7d6',

    "MCAS-Math": '#e8e9fc',
    "STAR-Math": '#e8e9fc',

    "DIBELS": '#e8fce8'
  },
  column: {
    flexGrow: '1',
    flexShrink: '0',
    padding: '22px 26px 16px 26px',
    cursor: 'pointer',
    borderColor: 'white',
    borderTop: 0,
    display: 'flex',
    flexDirection: 'column',
    margin: '0 5px 0 0',
    borderRadius: '5px 5px 5px 5px',
    border: '1px solid #ccc',
    width: '50%',
  }
};
