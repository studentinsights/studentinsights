import React from 'react';
import PropTypes from 'prop-types';
import StudentSectionsRoster from './StudentSectionsRoster';
import ProfilePdfDialog from './ProfilePdfDialog';
import FullCaseHistory from './FullCaseHistory';


export default class ProfileDetails extends React.Component {
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
  currentEducator: PropTypes.object
};

const styles = {
  roundedBox: {
    border: '1px solid #ccc',
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    borderRadius: 5,
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
  accessLeftTableCell: {
    paddingRight: 25
  },
  accessTableFootnote: {
    fontStyle: 'italic',
    fontSize: 13,
    marginTop: 15,
    marginBottom: 20
  },
  sectionsRosterTitle: {
    color: 'black',
    display: 'inline-block',
    flex: 'auto',
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
