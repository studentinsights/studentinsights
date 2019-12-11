import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import qs from 'query-string';
import Datepicker from '../components/Datepicker';
import {
  toSchoolYear,
  firstDayOfSchool
} from '../helpers/schoolYear';
import {toMoment} from '../helpers/toMoment';


// Render options for downloading a profile PDF
export default class ProfilePdfDialog extends React.Component {
  constructor(props, context) {
    super(props, context);

    const nowMoment = context.nowFn();
    this.state = {
      includeRestrictedNotes: false,
      filterFromDateText: firstDayOfSchool(toSchoolYear(nowMoment)-1).format('MM/DD/YYYY'),
      filterToDateText: nowMoment.format('MM/DD/YYYY')
    };

    this.checkboxContainerEl = null;
    this.onIncludeRestrictedNotesChanged = this.onIncludeRestrictedNotesChanged.bind(this);
    this.onFilterFromDateChanged = this.onFilterFromDateChanged.bind(this);
    this.onFilterToDateChanged = this.onFilterToDateChanged.bind(this);
    this.onClickGenerateStudentReport = this.onClickGenerateStudentReport.bind(this);
  }

  filterFromDateForQuery() {
    const {filterFromDateText} = this.state;
    return this.formatDateTextForRails(filterFromDateText);
  }

  filterToDateForQuery() {
    const {filterToDateText} = this.state;
    return this.formatDateTextForRails(filterToDateText);
  }

  // Normalize input date text into format Rails expects, tolerating empty string as null.
  // If the date is not valid, an error will be raised.
  formatDateTextForRails(dateText) {
    const moment = toMoment(dateText);
    if (!moment.isValid()) throw new Error('invalid date: ' + dateText);
    return moment.format('YYYY-MM-DD');
  }

  // Both dates need to be valid
  areDatesValid() {
    const {filterFromDateText, filterToDateText} = this.state;
    if (!toMoment(filterFromDateText).isValid() || !toMoment(filterToDateText).isValid() ) return false;
    return true;
  }

  studentReportURL() {
    const {studentId} = this.props;
    const {includeRestrictedNotes} = this.state;
    const filterFromDateForQuery = this.filterFromDateForQuery();
    const filterToDateForQuery = this.filterToDateForQuery();
    const checkboxEls = $(this.checkboxContainerEl).find('.ProfilePdfDialog-section').toArray();
    const sections = checkboxEls.filter(el => el.checked).map(el => el.value).join(',');
    const queryString = qs.stringify({
      sections: sections,
      from_date: filterFromDateForQuery,
      to_date: filterToDateForQuery,
      include_restricted_notes: includeRestrictedNotes
    });
    return `/students/${studentId}/student_report.pdf?${queryString}`;
  }

  onIncludeRestrictedNotesChanged(e) {
    this.setState({includeRestrictedNotes: e.target.checked});
  }

  onFilterFromDateChanged(filterFromDateText) {
    this.setState({filterFromDateText});
  }

  onFilterToDateChanged(filterToDateText) {
    this.setState({filterToDateText});
  }

  onClickGenerateStudentReport(event) {
    window.location = this.studentReportURL();
    return null;
  }

  render() {
    const {allowRestrictedNotes, showTitle, style} = this.props;
    const {includeRestrictedNotes} = this.state;
    const areDatesValid = this.areDatesValid();

    return (
      <div className="ProfilePdfDialog" style={{...styles.root, ...style}}>
        {showTitle && <h4 style={styles.title}>Student Report</h4>}
        <span style={styles.tableHeader}>Student privacy:</span>
        <div style={styles.optionsList}>
          <div style={styles.fixedWidthOption}>
            <label style={styles.optionLabel}>
              <input
                style={styles.optionCheckbox}
                type='checkbox'
                className="ProfilePdfDialog-include-restricted-notes"
                onChange={this.onIncludeRestrictedNotesChanged}
                value={includeRestrictedNotes}
              />
              Include restricted notes
            </label>
          </div>
        </div>
        <span style={styles.tableHeader}>Select sections to include in report:</span>
        <div style={styles.optionsList} ref={el => this.checkboxContainerEl = el}>
          {this.renderStudentReportSectionOption('notes','Notes')}
          {allowRestrictedNotes && (
            this.renderStudentReportSectionOption('restricted_notes','Restricted notes')
          )}
          {this.renderStudentReportSectionOption('services','Services')}
          {this.renderStudentReportSectionOption('attendance','Attendance')}
          {this.renderStudentReportSectionOption('discipline_incidents','Discipline Incidents')}
          {this.renderStudentReportSectionOption('assessments','Assessments')}
        </div>
        <span style={styles.tableHeader}>Select dates for the report:</span>
        <div style={styles.datesSection}>
          <div style={styles.dateBox}>
            <label style={styles.dateLabel}>From:</label>
            <Datepicker
              styles={{
                datepicker: styles.datepickerContainer,
                input: styles.datepickerInput
              }}
              value={this.state.filterFromDateText}
              onChange={this.onFilterFromDateChanged}
              datepickerOptions={{
                showOn: 'both',
                dateFormat: 'mm/dd/yy',
                minDate: undefined
              }} />
          </div>
          <div style={styles.dateBox}>
            <label style={styles.dateLabel}>Until:</label>
            <Datepicker
              styles={{
                datepicker: styles.datepickerContainer,
                input: styles.datepickerInput
              }}
              value={this.state.filterToDateText}
              onChange={this.onFilterToDateChanged}
              datepickerOptions={{
                showOn: 'both',
                dateFormat: 'mm/dd/yy',
                minDate: undefined
              }} />
          </div>
          <div style={{height: '2em'}}>
            {!this.areDatesValid() && <div className="RecordService-warning" style={styles.invalidDate}>Choose a valid date (end date is optional)</div>}
          </div>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          <button
            style={{background: (areDatesValid) ? undefined : '#ccc'}}
            disabled={!areDatesValid}
            className="btn btn-warning"
            onClick={this.onClickGenerateStudentReport}>
            Generate Student Report
          </button>
        </div>
      </div>
    );
  }

  renderStudentReportSectionOption(optionValue, optionName) {
    return (
      <div style={styles.fixedWidthOption}>
        <label style={styles.optionLabel}>
          <input
            style={styles.optionCheckbox}
            type='checkbox'
            className="ProfilePdfDialog-section"
            name={optionValue}
            defaultChecked
            value={optionValue} />
          {optionName}
        </label>
      </div>
    );
  }
}
ProfilePdfDialog.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
ProfilePdfDialog.propTypes = {
  studentId: PropTypes.number.isRequired,
  allowRestrictedNotes: PropTypes.bool.isRequired,
  showTitle: PropTypes.bool,
  style: PropTypes.object
};

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column'
  },
  title: {
    borderBottom: '1px solid #333',
    color: 'black',
    padding: 10,
    paddingLeft: 0,
    marginBottom: 10
  },
  tableHeader: {
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10
  },
  optionsList: {
    paddingLeft: 10,
    paddingBottom: 10
  },
  fixedWidthOption: {
    display: 'inline-block',
    width: '12em',
    height: '1.8em',
    verticalAlign: 'middle'
  },
  optionCheckbox: {
    marginRight: 5
  },
  optionLabel: {
    display: 'inline-block'
  },
  datesSection: {
    display: 'flex',
    marginLeft: 10,
    flexDirection: 'column'
  },
  dateBox: {
    display: 'flex',
    alignItems: 'center'
  },
  dateLabel: {
    display: 'block',
    width: '4em',
    marginBottom: 0
  },
  datepickerContainer: {
    display: 'block'
  },
  datepickerInput: {
    fontSize: 14,
    width: '8em',
    padding: 5
  },
  studentReportButton: {
    fontSize: 12,
    margin: 0
  }
};
