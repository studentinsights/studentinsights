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


// benchmark_assessment_key values:
const DIBELS_DORF_WPM = 'dibels_dorf_wpm';
const DIBELS_DORF_ACC = 'dibels_dorf_acc';
const F_AND_P_ENGLISH = 'f_and_p_english';
const INSTRUCTIONAL_NEEDS = 'instructional_needs';


// This describes the columns for a react-virtualized <Table /> used
// for entering reading benchmark data.
//
// This isn't a React component.
export function describeEntryColumns(params) {
  const {districtKey, nowMoment, currentEducatorId, doc, onDocChanged} = params;

  return [{
    label: 'Name',
    dataKey: 'student_name',
    width: 150,
    style: styles.cell,
    cellRenderer({rowData}) { // eslint-disable-line react/prop-types
      return renderStudentName(currentEducatorId, rowData);
    }
  }, {
    label: 'Homeroom',
    dataKey: 'homeroom_educator_name',
    width: 100,
    style: styles.cell,
    cellRenderer({rowData}) {  // eslint-disable-line react/prop-types
      const homeroomText = homeroomLastName(rowData);
      return (
        <span style={{
          ...styles.homeroomHeaderLabel,
          backgroundColor: pickHomeroomColor(homeroomText)
        }}>{homeroomText}</span>
      );
    }
  }, {
    label: '504',
    dataKey: 'plan_504',
    width: 70,
    style: styles.cell,
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
    }
  }, {
    label: 'IEP',
    dataKey: 'iep',
    width: 50,
    style: styles.cell,
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
    }
  }, {
    label: <span>English<br/>Learner</span>,
    dataKey: 'english_learner_level',
    width: 70,
    style: styles.cell,
    cellRenderer({rowData}) { // eslint-disable-line react/prop-types
      const linkText = englishLearnerLinkText(districtKey, rowData);
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
    }
  }, {
    label: <span>MTSS,<br/>2 years</span>,
    dataKey: 'mtss',
    width: 70,
    style: styles.cell,
    cellRenderer({rowData}) { // eslint-disable-line react/prop-types
      return renderMtss(rowData.mtss, nowMoment);
    }
  }, {
    label: <span style={styles.headerCell}>F&P level</span>,
    dataKey: F_AND_P_ENGLISH,
    width: 80,
    style: styles.dataCell,
    cellRenderer({rowData}) { // eslint-disable-line react/prop-types
      return createInputCell(F_AND_P_ENGLISH, rowData.id, doc, onDocChanged);
    }
  }, {
    label: <span style={styles.headerCell}>DORF, %<br/>accuracy</span>,
    dataKey: DIBELS_DORF_ACC,
    width: 80,
    style: styles.dataCell,
    cellRenderer({rowData}) { // eslint-disable-line react/prop-types
      return createInputCell(DIBELS_DORF_ACC, rowData.id, doc, onDocChanged);
    }
  }, {
    label: <span style={styles.headerCell}>DORF,<br/>words/min</span>,
    dataKey: DIBELS_DORF_WPM,
    width: 80,
    style: styles.dataCell,
    cellRenderer({rowData}) { // eslint-disable-line react/prop-types
      return createInputCell(DIBELS_DORF_WPM, rowData.id, doc, onDocChanged);
    }
  }, {
    label: (
      <div style={{...styles.headerCell, marginLeft: 10}}>
        <div>Instructional needs?</div>
        <div style={{fontWeight: 'normal'}}>(eg, blending, attention)</div>
      </div>
    ),
    width: 140,
    flexGrow: 1,
    style: {...styles.dataCell, marginLeft: 10, marginRight: 20},
    dataKey: INSTRUCTIONAL_NEEDS,
    cellRenderer({rowData}) { // eslint-disable-line react/prop-types
      return createInputCell(INSTRUCTIONAL_NEEDS, rowData.id, doc, onDocChanged, {
        style: {
          ...styles.dataInput,
          fontSize: 12,
          textAlign: 'left'
        }
      });
    }
  }];
}



// map dataKey to an accessor/sort function
export function sortFnsMap(doc, districtKey, nowMoment) {
  return {
    student_name(student) { return `${student.last_name}, ${student.first_name}`; },
    homeroom_educator_name(student) { return homeroomLastName(student); },
    plan_504(student) { return hasActive504Plan(student.plan_504) ? '504' : null; },
    iep(student) { return hasAnySpecialEducationData(student, student.latest_iep_document) ? 'IEP' : null; },
    english_learner_level(student) { return englishLearnerLinkText(districtKey, student); },
    mtss(student) { return renderMtss(student.mtss, nowMoment); },
    f_and_p_english(student) { return readDoc(doc, student.id, F_AND_P_ENGLISH) || 'a'; },
    dibels_dorf_acc(student) { return parseInt(readDoc(doc, student.id, DIBELS_DORF_ACC), 10) || Number.NEGATIVE_INFINITY; },
    dibels_dorf_wpm(student) { return parseInt(readDoc(doc, student.id, DIBELS_DORF_WPM), 10) || Number.NEGATIVE_INFINITY; },
    instructional_needs(student) { return readDoc(doc, student.id, INSTRUCTIONAL_NEEDS); }
  };
}


// bind the input to the of state for (`key`, studenI
function createInputCell(benchmarkAssessmentKey, studentId, doc, onDocChanged, props = {}) {
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

const homeroomColors = [
  '#bcbddc',
  '#9e9ac8',
  '#807dba',
  '#6a51a3',
  '#4a1486'
];
function pickHomeroomColor(homeroomText) {
  return homeroomColors[parseInt(hash(homeroomText), 16) % homeroomColors.length];
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

function englishLearnerLinkText(districtKey, rowData) {
  if (!isEnglishLearner(districtKey, rowData.limited_english_proficiency)) return null;
  const level = accessLevelNumber(rowData.access);
  return (level) ? `Level ${level}` : 'ELL';
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
  },
  homeroomHeaderLabel: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.75,
    color: 'white',
    width: 80,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 3,
    paddingBottom: 3
  }
};
