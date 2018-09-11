import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {AutoSizer} from 'react-virtualized';
import * as Routes from '../helpers/Routes';
import {
  hasStudentPhotos,
  supportsHouse,
  shouldDisplayHouse
} from '../helpers/PerDistrict';
import HelpBubble, {
  modalFromLeft,
  modalFromRight,
  modalFullScreenWithVerticalScroll
} from '../components/HelpBubble';
import StudentPhoto from '../components/StudentPhoto';
import LightCarousel from './LightCarousel';
import ProfilePdfDialog from './ProfilePdfDialog';
import LightHeaderSupportBits from './LightHeaderSupportBits';


/*
UI component for top-line information like the student's name, school,
photo and classroom.  Also includes a carousel of humanizing quotes about
the student, and some buttons for exporting, etc.
*/
export default class LightProfileHeader extends React.Component {
  hasPhoto() {
    const {districtKey} = this.context;
    const {student} = this.props;
    const shouldShowPhoto = hasStudentPhotos(districtKey);
    return (shouldShowPhoto && student.has_photo);
  }

  render() {
    const {style} = this.props;
    const hasPhoto = this.hasPhoto();
    const firstColumnFlex = (hasPhoto) ? 1 : 0;
    const secondColumnFlex = (hasPhoto) ? 2 : 3;
    return (
      <div className="LightProfileHeader" style={{...styles.root, style}}>
        <div style={{flex: firstColumnFlex, display: 'flex', flexDirection: 'row'}}>
          {this.renderStudentPhotoOrNull()}
        </div>
        <div style={{flex: secondColumnFlex, display: 'flex', flexDirection: 'row'}}>
          {this.renderOverview()}
        </div>
        <div style={{flex: 2, display: 'flex', flexDirection: 'row', marginTop: 10}}>
          {this.renderGlance()}
          {this.renderButtons()}
        </div>
      </div>
    );
  }

  renderStudentPhotoOrNull() {
    const {student} = this.props;
    if (!this.hasPhoto()) return null;
    
    return (
      <div style={{flex: 1, marginLeft: 10}}>
        <AutoSizer>
          {({width, height}) => (
            <StudentPhoto
              style={{...styles.photoEl, maxWidth: width, maxHeight: height}}
              student={student} />
          )}
        </AutoSizer>
      </div>
    );
  }

  renderOverview() {
    const {student} = this.props;
    return (
      <div style={styles.overview}>
        <div style={styles.overviewColumn}>
          <a href={Routes.studentProfile(student.id)} style={styles.nameTitle}>
            {student.first_name + ' ' + student.last_name}
          </a>
          {this.renderHomeroomOrEnrollmentStatus()}
          {this.renderHouseAndGrade()}
          <div style={styles.subtitleItem}>
            {student.school_name}
          </div>
        </div>
        <div style={styles.infoBitsRow}>
          <div style={styles.infoBitsBox}>
            <div style={{marginTop: 20}}>{this.renderAge()}</div>
            {this.renderDateOfBirth()}
            <div style={styles.subtitleItem}>{student.home_language} at home</div>
            {this.renderContactIcon()}
          </div>
          <div style={styles.infoBitsBox}>
            {this.renderSupportBits()}
          </div>
          {this.hasPhoto() ? null : <div style={{flex: 1}} />}
        </div>
      </div>
    );
  }

  renderHouseAndGrade() {
    const {districtKey} = this.context;
    const {student} = this.props;
    const showHouse = (
      supportsHouse(districtKey) &&
      shouldDisplayHouse({local_id: student.school_local_id}) &&
      student.house
    );

    return (
      <div style={styles.subtitleItem}>
        {'Grade ' + student.grade}
        {showHouse && `, ${student.house} house`}
      </div>
    );
  }

  renderHomeroomOrEnrollmentStatus() {
    const student =  this.props.student;
    if (student.enrollment_status === 'Active') {
      if (student.homeroom_name) return (
        <a
          className="homeroom-link"
          href={Routes.homeroom(student.homeroom_id)}
          style={styles.subtitleItem}>
          {'Homeroom ' + student.homeroom_name}
        </a>
      );

      return (<span style={styles.subtitleItem}>No homeroom</span>);
    } else {
      return (
        <span style={styles.subtitleItem}>
          {student.enrollment_status}
        </span>
      );
    }
  }

  renderDateOfBirth () {
    const student =  this.props.student;
    const dateOfBirth = student.date_of_birth;
    if (!dateOfBirth) return null;

    const momentDOB = moment.utc(dateOfBirth);
    return <div style={styles.subtitleItem}>{momentDOB.format('M/D/YYYY')}</div>;
  }

  renderAge() {
    const student =  this.props.student;
    const dateOfBirth = student.date_of_birth;
    if (!dateOfBirth) return null;

    const momentDOB = moment.utc(dateOfBirth);
    return <div style={styles.subtitleItem}>{moment().diff(momentDOB, 'years')} years old</div>;
  }

  renderContactIcon () {
    return (
      <HelpBubble
        style={{marginLeft: 0, display: 'inline-block'}}
        linkStyle={styles.subtitleItem}
        teaser="Family contacts"
        modalStyle={modalFromLeft}
        title="Family contacts"
        content={this.renderContactInformationDialog()} />
    );
  }

  renderContactInformationDialog(){
    const {student} = this.props;
    return (
      <span>
        <span style={styles.contactItem}>
          {student.student_address}
        </span>
        <span style={styles.contactItem}>
          {student.primary_phone}
        </span>
        <span style={styles.contactItem}>
          <a href={'mailto:'+ student.primary_email}>{student.primary_email}</a>
        </span>
      </span>
    );
  }


  renderSupportBits() {
    const {student, iepDocument, access, activeServices} = this.props;
    return (
      <LightHeaderSupportBits
        student={student}
        access={access}
        iepDocument={iepDocument}
        activeServices={activeServices}
      />
    );
  }

  renderButtons() {
    return (
      <div style={{marginLeft: 10, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
        {this.renderProfilePdfButton()}
        {this.renderFullCaseHistoryButton()}
      </div>
    );
  }

  renderProfilePdfButton() {
    const {student} = this.props;
    return (
      <HelpBubble
        style={{marginLeft: 0}}
        modalStyle={modalFromRight}
        teaser={
          <svg style={styles.svgIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
            <path d="M0 0h24v24H0z" fill="none"/>
          </svg>
        }
        tooltip="Print PDF"
        title="Print PDF"
        content={<ProfilePdfDialog studentId={student.id} style={{backgroundColor: 'white'}} />}
      />
    );
  }

  renderFullCaseHistoryButton() {
    const {renderFullCaseHistory} = this.props;
    return (
      <HelpBubble
        style={{marginLeft: 0}}
        modalStyle={modalFullScreenWithVerticalScroll}
        teaser={
          <svg style={styles.svgIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z"/>
            <path d="M0 0h24v24H0z" fill="none"/>
          </svg>
        }
        tooltip="List all data points"
        title="List all data points"
        content={renderFullCaseHistory()}
      />
    );
  }

  renderGlance() {
    const {profileInsights, student} = this.props;
    return (
      <div style={styles.carousel}>
        <LightCarousel
          profileInsights={profileInsights}
          student={student}
        />
      </div>
    );
  }
}

LightProfileHeader.propTypes = {
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    grade: PropTypes.string,
    disability: PropTypes.string,
    sped_placement: PropTypes.string,
    plan_504: PropTypes.string,
    limited_english_proficiency: PropTypes.string,
    enrollment_status: PropTypes.string,
    home_language: PropTypes.string,
    date_of_birth: PropTypes.string,
    student_address: PropTypes.string,
    primary_phone: PropTypes.string,
    primary_email: PropTypes.string,
    house: PropTypes.string,
    counselor: PropTypes.string,
    sped_liaison: PropTypes.string,
    homeroom_id: PropTypes.number,
    school_name: PropTypes.string,
    school_local_id: PropTypes.string,
    homeroom_name: PropTypes.string,
    has_photo: PropTypes.bool
  }).isRequired,
  iepDocument: PropTypes.object,
  activeServices: PropTypes.array.isRequired,
  access: PropTypes.object,
  profileInsights: PropTypes.array.isRequired,
  renderFullCaseHistory: PropTypes.func.isRequired,
  style: PropTypes.object
};
LightProfileHeader.contextTypes = {
  districtKey: PropTypes.string.isRequired
};

const styles = {
  root: {
    display: 'flex',
    height: 220,
    fontSize: 14,
    padding: 20,
    marginBottom: 20
  },

  overview: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: 2
  },
  photo: {
    paddingLeft: 10,
    paddingRight: 20
  },
  photoEl: {
    borderRadius: 2,
    border: '1px solid #ccc',
    marginRight: 20
  },
  nameTitle: {
    fontWeight: 'bold',
    marginRight: 5,
    fontSize: 20
  },
  infoBitsRow: {
    display: 'flex',
    flexDirection: 'row'
  },
  infoBitsBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end'
  },
  overviewColumn: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  subtitleItem: {
    display: 'inline-block',
    fontSize: 14
  },
  contactItem: {
    padding: 6,
    display: 'flex'
  },
  svgIcon: {
    fill: "#3177c9",
    opacity: 0.5
  },
  carousel: {
    flex: 1,
    display: 'flex'
  }
};

