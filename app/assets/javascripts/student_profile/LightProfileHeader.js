import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import {AutoSizer} from 'react-virtualized';
import {isLimitedOrFlep} from '../helpers/language';
import * as Routes from '../helpers/Routes';
import {hasStudentPhotos} from '../helpers/PerDistrict';
import {hasInfoAbout504Plan} from '../helpers/PerDistrict';
import HelpBubble from '../components/HelpBubble';
import Educator from '../components/Educator';
import StudentPhoto from '../components/StudentPhoto';
import LightCarousel from './LightCarousel';
import {parseTransitionNoteText} from './lightTransitionNotes';

/*
UI component for top-line information like the student's name, school,
photo and classroom.  Also includes a carousel of humanizing quotes about
the student, and some buttons for exporting, etc.
*/
export default class LightProfileHeader extends React.Component {
  render() {
    const {style} = this.props;
    return (
      <div className="LightProfileHeader" style={{...styles.root, style}}>
        <div style={{flex: 3, display: 'flex', flexDirection: 'row'}}>
          {this.renderStudentPhotoOrNull()}
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
    const {student, districtKey} = this.props;
    const shouldShowPhoto = hasStudentPhotos(districtKey);
    if (!shouldShowPhoto) return null;

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
          <div style={styles.subtitleItem}>{'Grade ' + student.grade}</div>
          <a href={Routes.school(student.school_id)} style={styles.subtitleItem}>
            {student.school_name}
          </a>
        </div>
        <div style={styles.headerBitsRow}>
          <div style={styles.headerBitsColumn}>
            <div style={{marginTop: 20}}>{this.renderAge()}</div>
            {this.renderDateOfBirth()}
            <div style={styles.subtitleItem}>{student.home_language} at home</div>
            {this.renderContactIcon()}
          </div>
          <div style={styles.headerBitsColumn}>
            <div style={{marginTop: 20}}>{this.renderIEPLink()}</div>
            {this.render504()}
            {this.renderLanguage()}
          </div>
        </div>
      </div>
    );
  }

  renderIEPLink() {
    const {student} = this.props;
    const {iepDocument} = student;
    const hasDisability = student.disability !== 'None' && student.disability !== null;
    const hasLiaison = student.sped_liaison !== null && student.sped_liaison !== undefined;
    const spedPlacement = student.sped_placement || null;
    const hasIep = (iepDocument || hasDisability || hasLiaison || spedPlacement);

    if (hasIep && iepDocument) return <a target="_blank" href={`/iep_documents/${iepDocument.id}`}>IEP</a>;
    if (hasIep && hasDisability) return <span>IEP for {student.disability}</span>;
    if (hasIep) return <span>IEP</span>;
    return null;
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
    if (!isLimitedOrFlep(student)) return null;

    const el = <div style={styles.subtitleItem}>{student.limited_english_proficiency}</div>;
    if (!access) return el;

    return (
      <HelpBubble
        style={{marginLeft: 0, display: 'block'}}
        linkStyle={{fontSize: 14}}
        teaser={el}
        title="Language learning"
        content={this.renderLanguageDialog()} />
    );
  }

  renderLanguageDialog() {
    const {access} = this.props;
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
  }

  renderButtons() {
    return (
      <div style={{marginLeft: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
        <div>
          <a title="Next student" href="#" style={{display: 'block'}}>
            <svg style={styles.svgIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              <path d="M0 0h24v24H0z" fill="none"/>
            </svg>
          </a>
        </div>
        <div>
          <a title="Print PDF" href="#" style={{display: 'block'}}>
            <svg style={styles.svgIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
              <path d="M0 0h24v24H0z" fill="none"/>
            </svg>
          </a>
          <a title="List all data points" href="#" style={{display: 'block'}}>
            <svg style={styles.svgIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z"/>
              <path d="M0 0h24v24H0z" fill="none"/>
            </svg>
          </a>
        </div>
      </div>
    );
  }

  renderGlance() {
    const {transitionNotes, educatorsIndex, student} = this.props;
    const style = {fontSize: 12};
    const useRealTransitionNotes = window.location.search.indexOf('transition') !== -1;
    const quotes = (useRealTransitionNotes)
      ? quotesFrom(transitionNotes, educatorsIndex, style)
      : sampleQuotes(style);
    const upsellQuotes = [{
      quote: `Add an insight about ${student.first_name}!`,
      withoutQuotes: true,
      source: <span>See <a href="#" style={style}>Ileana</a> or <a href="#" style={style}>Manuel</a> for examples from other educators.</span>,
      tagline: ''
    }];
    const quotesOrUpsell = (quotes.length === 0) ? upsellQuotes : quotes;
    return (
      <div style={{
        width: 350,
        background: '#eee'
      }}>
        <LightCarousel quotes={quotesOrUpsell} />
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
        linkStyle={{fontSize: 14}}
        teaser={<div style={styles.subtitleItem}>Family contacts</div>}
        title="Family contact information"
        content={this.renderContactInformationDialog()} />
    );
  }

  renderContactInformationDialog(){
    const student = this.props.student;
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
}

LightProfileHeader.propTypes = {
  student: PropTypes.object.isRequired,
  access: PropTypes.object,
  educatorsIndex: PropTypes.object,
  transitionNotes: PropTypes.array,
  districtKey: PropTypes.string.isRequired,
  style: PropTypes.object
};

const styles = {
  root: {
    display: 'flex',
    minHeight: 200,
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

  headerBitsRow: {
    display: 'flex',
    flexDirection: 'row'
  },
  headerBitsColumn: {
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
    display: 'block'
  },
  contactItem: {
    padding: 6,
    display: 'flex'
  },
  svgIcon: {
    fill: "#3177c9",
    opacity: 0.5
  }
};


function sampleQuotes(style) {  
  const quotes = [
    'Smart, very athletic, baseball, works w/uncle (carpenter)',
    'Truly bilingual in English & French',
    'Very social; gets along well w/adults and most kids'
  ];
  return quotes.map(quote => {
    const dateText = moment.utc().subtract(Math.random() * 30, 'days').format('M/D/YY');
    const tagline = <span><a href="#" style={style}>Samwise Gamgee</a>, Counselor</span>;
    const source = <span><a href="#" style={{fontSize: 12}}>Transition note</a> on {dateText}</span>;
    return {quote, tagline, source};
  });
}

function quotesFrom(transitionNotes, educatorsIndex, style) {
  const safeNotes = transitionNotes.filter(transitionNote => !transitionNote.is_restricted);

  return _.flatten(safeNotes.map(note => {
    const dateText = moment.utc(note.recorded_at).format('M/D/YY');
    const educator = educatorsIndex[note.educator_id] || educatorsIndex[_.keys(educatorsIndex)[0]];
    const tagline = <span>from <Educator style={style} educator={educator} /></span>;
    const source = (
      <span>
        <span>in</span>
        <HelpBubble
          style={{marginLeft: 5, marginRight: 5}}
          linkStyle={style}
          teaser="Transition note"
          title="Transition note"
          content={renderTransitionNote(note.text, dateText, <Educator educator={educator} />)} />
        <span>on {dateText}</span>
      </span>
    );

    // only strengths for now
    const noteParts = parseTransitionNoteText(note.text);
    const quote = noteParts.strengths;
    if (!quote || quote.length === 0) return [];
    return [{quote, source, tagline}];
  }));
   
}

function renderTransitionNote(text, dateText, educatorEl) {
  return (
    <div>
      <div style={{
        whiteSpace: 'pre',
        marginBottom: 10,
        padding: 20,
        border: '1px solid #ccc',
        background: '#eee'
      }}>{text}</div>
      <div>by {educatorEl}</div>
      <div>on {dateText}</div>
    </div>
  );
}