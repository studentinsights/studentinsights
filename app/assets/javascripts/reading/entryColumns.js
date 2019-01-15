import React from 'react';
import _ from 'lodash';
import hash from 'object-hash';
import {hasActive504Plan} from '../helpers/PerDistrict';
import {toMomentFromRailsDate} from '../helpers/toMoment';
import {toSchoolYear, firstDayOfSchool} from '../helpers/schoolYear';
import {isEnglishLearner, accessLevelNumber} from '../helpers/language';
import {hasAnySpecialEducationData} from '../helpers/specialEducation';
import HelpBubble, {
  modalFullScreenFlex,
  dialogFullScreenFlex
} from '../components/HelpBubble';
import PerDistrictContainer from '../components/PerDistrictContainer';
import IepDialog from './IepDialog';

// TODO(kr) import paths
import LanguageStatusLink from '../student_profile/LanguageStatusLink'; 
import EdPlansPanel from '../student_profile/EdPlansPanel';


export function describeEntryColumns(params) {
  const {districtKey, nowMoment, currentEducatorId, doc, onDocChanged} = params;

  // TODO fix jumping
  const homeroomColors = [
    '#bcbddc',
    '#9e9ac8',
    '#807dba',
    '#6a51a3',
    '#4a1486'
  ];
  const homeroomColor = (homeroomText) => {
    return homeroomColors[parseInt(hash(homeroomText), 16) % homeroomColors.length];
  };
  return [{
    label: 'Name',
    dataKey: 'name',
    cellRenderer({rowData}) {  // eslint-disable-line react/prop-types
      return renderStudentName(currentEducatorId, rowData);
    },
    width: 150,
    style: styles.cell
  }, {
    label: <span>Homeroom</span>,
    dataKey: 'homeroom',
    cellRenderer({rowData}) {  // eslint-disable-line react/prop-types
      const homeroomText = homeroomLastName(rowData);
      return (
        <span style={{
          textAlign: 'center',
          fontSize: 12,
          opacity: 0.75,
          color: 'white',
          width: 80,
          paddingLeft: 5,
          paddingRight: 5,
          paddingTop: 3,
          paddingBottom: 3,
          backgroundColor: homeroomColor(homeroomText)}}>
          {homeroomText}
        </span>
      );
    },
    width: 100,
    style: styles.cell
  }, {
    label: '504',
    dataKey: 'plan_504',
    cellRenderer({rowData}) {  // eslint-disable-line react/prop-types
      if (!hasActive504Plan(rowData.plan_504)) return null;
      return (
        <HelpBubble
          style={{marginLeft: 0, display: 'block'}}
          teaser="504"
          linkStyle={styles.link}
          modalStyle={modalFullScreenFlex}
          dialogStyle={dialogFullScreenFlex}
          title={`${rowData.first_name}'s 504 plan`}
          withoutSpacer={true}
          withoutContentWrapper={true}
          content={render504Dialog(districtKey, rowData)}
        />
      );
    },
    width: 70,
    style: styles.cell
  }, {
    label: 'IEP',
    dataKey: 'iep',
    cellRenderer({rowData}) {  // eslint-disable-line react/prop-types
      if (!hasAnySpecialEducationData(rowData, rowData.latest_iep_document)) return null;
      return (
        <PerDistrictContainer districtKey={districtKey}>
          <IepDialog
            student={rowData}
            iepDocument={rowData.latest_iep_document}>
            IEP
          </IepDialog>
        </PerDistrictContainer>
      );
    },
    width: 50,
    style: styles.cell
  }, {
    label: <span>English<br/>Learner</span>,
    dataKey: 'access',
    cellRenderer({rowData}) {  // eslint-disable-line react/prop-types
      if (!isEnglishLearner(districtKey, rowData.limited_english_proficiency)) return null;

      const level = accessLevelNumber(rowData.access);
      const linkText = (level) ? `Level ${level}` : 'ELL';
      return (
        <PerDistrictContainer districtKey={districtKey}>
          <LanguageStatusLink
            linkEl={linkText}
            style={styles.link}
            studentFirstName={rowData.first_name}
            ellTransitionDate={rowData.ell_transition_date}
            limitedEnglishProficiency={rowData.limited_english_proficiency}
            access={rowData.access}
          />
        </PerDistrictContainer>
      );
    },
    width: 70,
    style: styles.cell
  }, {
    label: <span>MTSS,<br/>2 years</span>,
    dataKey: 'mtss',
    cellRenderer({rowData}) {  // eslint-disable-line react/prop-types
      return renderMtss(rowData.mtss, nowMoment);
    },
    width: 70,
    style: styles.cell
  }, {
    label: <span style={styles.headerCell}>F&P level,<br />benchmark</span>,
    dataKey: 'f_and_p_english',
    cellRenderer: createInputCell.bind(null, 'f_and_p_english', doc, onDocChanged, {}),
    width: 80,
    style: styles.dataCell
  }, {
    label: <span style={styles.headerCell}>DORF,<br/>% accuracy</span>,
    dataKey: 'f_and_p',
    cellRenderer: createInputCell.bind(null, 'dibels_dorf_acc', doc, onDocChanged, {}),
    width: 80,
    style: styles.dataCell
  }, {
    label: <span style={styles.headerCell}>DORF,<br/>words/min</span>,
    dataKey: 'dibels_dorf_wpm',
    cellRenderer: createInputCell.bind(null, 'dibels_dorf_wpm', doc, onDocChanged, {}),
    width: 80,
    style: styles.dataCell
  }, {
    label: (
      <div style={{...styles.headerCell, marginLeft: 10}}>
        <div>Instructional needs?</div>
        <div style={{fontWeight: 'normal'}}>(eg, blending, attention)</div>
      </div>
    ),
    dataKey: 'what_else',
    cellRenderer: createInputCell.bind(null, 'instructional_needs', doc, onDocChanged, {
      style: {
        ...styles.dataInput,
        fontSize: 12,
        textAlign: 'left'
      }
    }),
    width: 140,
    flexGrow: 1,
    style: {...styles.dataCell, marginLeft: 10, marginRight: 20}
  }];
}



// map dataKey to an accessor/sort function
export function sortFnsMap(districtKey) {
  return {
    name(student) { return `${student.last_name}, ${student.first_name}`; },
    homeroom(student) { return homeroomLastName(student); },
    plan_504(student) { return hasActive504Plan(student.plan_504) ? '504' : null; },
    iep(student) { return hasAnySpecialEducationData(student, {}) ? 'IEP' : null; },
    access(student) {
      if (!isEnglishLearner(districtKey, student.limited_english_proficiency)) return null;
      return accessLevelNumber(student.access);
    },
    // TODO mtss
    // TODO entered data, numeric and text
  };
}


// bind the input to the of state for (`key`, studenI
function createInputCell(benchmarkAssessmentKey, doc, onDocChanged, props, {rowData}) {
  const studentId = rowData.id;
  const value = readDoc(doc, studentId, benchmarkAssessmentKey);
  return (
    <input
      type="text"
      style={styles.dataInput}
      value={value}
      onChange={e => onDocChanged(studentId, benchmarkAssessmentKey, e.target.value)}
      {...props}
    />
  );
}

function readDoc(doc, studentId, benchmarkAssessmentKey) {
  return (doc[studentId] || {})[benchmarkAssessmentKey] || '';
}

// Because of authorization rules, sometimes the user will be able to 
// see the full profile, and sometimes not.
function renderStudentName(currentEducatorId, student) {
  const nameEl = (student.homeroom && student.homeroom.educator.id === currentEducatorId)
    ? <a tabIndex={-1} style={{fontSize: 14}} href={`/students/${student.id}`} target="_blank" rel="noopener noreferrer">{student.first_name} {student.last_name}</a>
    : `${student.first_name} ${student.last_name}`;
  
  // not sure image looks good, also probably need caching instead of naive
  // image tags {/*<StudentPhoto student={student} height={40} />*/}
  return nameEl;
}

function render504Dialog(districtKey, student) {
  const edPlans = student.ed_plans;
  const studentName = `${student.first_name} ${student.last_name}`;
  return (
    <PerDistrictContainer districtKey={districtKey}>
      <EdPlansPanel edPlans={edPlans} studentName={studentName} />
    </PerDistrictContainer>
  );
}

export function homeroomLastName(student) {
  return (student.homeroom)
    ? student.homeroom.educator.full_name.split(',')[0]
    : '(none)';
}

// only render this school year and 2 years back (push to server?)
function renderMtss(mtssList, nowMoment) {
  if (mtssList.length === 0) return null;

  const startOfSchoolYearMoment = firstDayOfSchool(toSchoolYear(nowMoment.toDate()) - 2);
  const mtssMoments = mtssList.map(mtss => toMomentFromRailsDate(mtss.recorded_at));
  const mtssMomentsThisYear = mtssMoments.filter(mtssMoment => mtssMoment.isAfter(startOfSchoolYearMoment));
  const latestMtssMoment = _.last(mtssMomentsThisYear.sort());
  if (!latestMtssMoment) return null;

  return latestMtssMoment.format('M/D/YY');
}


const styles = {
  headerCell: {
    fontSize: 12
  },
  cell: {
    display: 'flex',
    alignItems: 'center'
  },
  dataCell: {
    display: 'flex'
  },
  dataInput: {
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 3,
    paddingBottom: 3,
    fontSize: 16,
    width: '100%',
    textAlign: 'center'
  },
  link: {
    fontSize: 14
  }
};
