import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {prettyEnglishProficiencyText} from '../helpers/language';
import {
  hasInfoAbout504Plan,
  supportsSpedLiaison
} from '../helpers/PerDistrict';
import {
  hasAnySpecialEducationData,
  prettyProgramOrPlacementText,
  prettyLevelOfNeedText,
  prettyIepTextForStudent,
  cleanSpecialEducationValues
} from '../helpers/specialEducation';
import {maybeCapitalize} from '../helpers/pretty';
import HelpBubble, {
  modalFromLeft,
  modalFullScreenFlex,
  dialogFullScreenFlex
} from '../components/HelpBubble';
import AccessPanel from './AccessPanel';
import Pdf, {canViewPdfInline} from './Pdf';

/*
UI component for seconds column with extra bits about the
student (eg, IEP, FLEP, staff contacts).
*/
export default class LightHeaderSupportBits extends React.Component {
  render() {
    const {style} = this.props;

    // This has to fit within five lines, given parent layout.
    return (
      <div className="LightHeaderSupportBits" style={{...styles.root, style}}>
        {this.render504()}
        {this.renderProgram()}
        {this.renderIEP()}
        {this.renderLanguage()}
        {this.renderEducators()}
      </div>
    );
  }

  renderEducators() {
    return (
      <HelpBubble
        style={{marginLeft: 0, display: 'inline-block'}}
        linkStyle={styles.subtitleItem}
        teaser="Educator contacts"
        modalStyle={modalFromLeft}
        title="Educator contacts"
        content={this.renderEducatorContactsDialog()} />
    );
  }

  renderEducatorContactsDialog() {
    return (
      <div style={{fontSize: 14}}>
        <div style={styles.contactItem}>
          {this.renderCounselor()}
        </div>
        <div style={styles.contactItem}>
          {this.renderSpedLiaison()}
        </div>
        {this.renderOtherStaff()}
      </div>
    );
  }

  renderCounselor() {
    const {student} = this.props;
    const {counselor} = student;
    if (!counselor) return null;

    return (
      <div style={styles.contactItem}>
        <div>Counselor:</div>
        <div>{maybeCapitalize(counselor)}</div>
      </div>
    );
  }

  renderSpedLiaison() {
    const {districtKey} = this.context;
    if (supportsSpedLiaison(districtKey)) return false;

    const {student} = this.props;
    const spedLiaison = student.sped_liaison;
    if (spedLiaison === null || spedLiaison === undefined) return null;

    return (
      <div style={styles.contactItem}>
        <div>SPED liaison:</div>
        <div>{maybeCapitalize(spedLiaison)}</div>
      </div>
    );
  }

  renderOtherStaff() {
    const {activeServices} = this.props;
    const rawEducatorNames = activeServices.map(service => service.provided_by_educator_name);
    const educatorNames = _.compact(_.uniq(rawEducatorNames)).filter(name => name !== '');
    if (educatorNames.length === 0) return null;

    return (
      <div style={styles.contactItem}>
        <div>Educators providing services:</div>
        {educatorNames.map(educatorName => (
          <div key={educatorName}>{educatorName}</div>
        ))}
      </div>
    );
  }

  renderIEP() {
    const {student, iepDocument} = this.props;
    if (!hasAnySpecialEducationData(student, iepDocument)) return null;
    
    const specialEducationText = prettyIepTextForStudent(student);
    const shouldRenderPdfInline = canViewPdfInline();
    return (
      <HelpBubble
        style={{marginLeft: 0, display: 'block'}}
        teaser={specialEducationText}
        linkStyle={styles.subtitleItem}
        modalStyle={shouldRenderPdfInline ? modalFullScreenFlex : modalFromLeft}
        dialogStyle={shouldRenderPdfInline ? dialogFullScreenFlex : {}}
        title={`${student.first_name}'s ${specialEducationText}`}
        withoutSpacer={true}
        withoutContentWrapper={true}
        content={this.renderIEPDialog(shouldRenderPdfInline)}
      />
    );
  }

  renderProgram() {
    const {student} = this.props;
    const prettyText = prettyProgramOrPlacementText(student);
    if (!prettyText) return null;

    return (
      <div style={styles.subtitleItem}>{prettyText}</div>
    );
  }

  renderIEPDialog(shouldRenderPdfInline) {
    const {districtKey} = this.context;
    const {student, iepDocument} = this.props;

    const spedLiaison = student.sped_liaison;
    const {program, placement, levelOfNeed, disability} = cleanSpecialEducationValues(student);
    return (
      <div style={styles.iepDialog}>
        {supportsSpedLiaison(districtKey) && spedLiaison && (
          <div style={styles.contactItem}>
            <div>SPED liaison: {spedLiaison}</div>
          </div>
        )}
        {program && (
          <div style={styles.contactItem}>
            <div>Program: {program}</div>
          </div>
        )}
        {placement && (
          <div style={styles.contactItem}>
            <div>Placement: {placement}</div>
          </div>
        )}
        {disability && (
          <div style={styles.contactItem}>
            <div>Disability: {disability}</div>
          </div>
        )}
        {levelOfNeed && (
          <div style={styles.contactItem}>
            <div>Level of need: {prettyLevelOfNeedText(levelOfNeed)}</div>
          </div>
        )}
        {iepDocument && (
          <div style={{...styles.contactItem, ...styles.iepDocumentSection}}>
            <a href={`/iep_documents/${iepDocument.id}`} style={styles.subtitleItem}>Download IEP at a glance PDF</a>
            {shouldRenderPdfInline && this.renderPdfInline(iepDocument.id)}
          </div>
        )}
      </div>
    );
  }

  renderPdfInline(iepDocumentId) {
    const url = `/iep_documents/${iepDocumentId}`;

    return (
      <Pdf
        style={styles.pdfInline}
        url={url}
      />
    );
  }

  render504() {
    const {student} = this.props;
    const plan504 = student.plan_504;
    return (hasInfoAbout504Plan(plan504))
      ? <div style={styles.subtitleItem}>504 plan</div>
      : null;
  }

  renderLanguage() {
    const {student, access} = this.props;
    const el = <div style={styles.subtitleItem}>{prettyEnglishProficiencyText(student.limited_english_proficiency)}</div>;

    if (!access) return el;
    return (
      <HelpBubble
        style={{marginLeft: 0, display: 'block'}}
        teaser={el}
        linkStyle={styles.subtitleItem}
        modalStyle={modalFromLeft}
        title="Language learning"
        content={<AccessPanel access={access} />}
      />
    );
  }
}

LightHeaderSupportBits.propTypes = {
  iepDocument: PropTypes.object,
  access: PropTypes.object,
  activeServices: PropTypes.arrayOf(PropTypes.shape({
    provided_by_educator_name: PropTypes.string
  })).isRequired,
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
  style: PropTypes.object
};

const styles = {
  root: {
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
    paddingTop: 2
  },
  svgIcon: {
    fill: "#3177c9",
    opacity: 0.5
  },
  carousel: {
    flex: 1,
    display: 'flex'
  },
  iepDialog: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    fontSize: 14
  },
  flexVertical: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  pdfInline: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    marginTop: 10,
    marginBottom: 10,
    border: '1px solid #333'
  },
  iepDocumentSection: {
    marginTop: 20,
    marginBottom: 20,
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  }
};

