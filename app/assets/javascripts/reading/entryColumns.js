import React from 'react';
import hash from 'object-hash';
import {hasActive504Plan} from '../helpers/PerDistrict';
import {isEnglishLearner, accessLevelNumber} from '../helpers/language';
import {hasActiveIep} from '../helpers/specialEducation';
import {render504Chip, renderIepChip, renderEnglishLearnerChip, renderMtss} from './chips';
import {readDoc} from './readingData';
import {
  DIBELS_DORF_WPM, 
  DIBELS_DORF_ACC,
  F_AND_P_ENGLISH,
  INSTRUCTIONAL_NEEDS
} from './thresholds';


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
    cellRenderer({rowData}) {  return render504Chip(districtKey, rowData); } // eslint-disable-line react/prop-types
  }, {
    label: 'IEP',
    dataKey: 'iep',
    width: 50,
    style: styles.cell,
    cellRenderer({rowData}) {  return renderIepChip(districtKey, rowData); } // eslint-disable-line react/prop-types
  }, {
    label: <span>English<br/>Learner</span>,
    dataKey: 'english_learner_level',
    width: 70,
    style: styles.cell,
    cellRenderer({rowData}) {  return renderEnglishLearnerChip(districtKey, rowData); } // eslint-disable-line react/prop-types
  }, {
    label: <span>MTSS,<br/>2 years</span>,
    dataKey: 'mtss',
    width: 70,
    style: styles.cell,
    cellRenderer({rowData}) { // eslint-disable-line react/prop-types
      return renderMtss(rowData.mtss, nowMoment);
    }
  }, {
    dataKey: F_AND_P_ENGLISH,
    label: (
      <span style={{...styles.headerCell, ...styles.notSortable}}>
        F&P level
      </span>
    ),
    disableSort: true,
    width: 85,
    style: styles.dataCell,
    cellRenderer({rowData}) { // eslint-disable-line react/prop-types
      return createInputCell(F_AND_P_ENGLISH, rowData.id, doc, onDocChanged);
    }
  }, {
    dataKey: DIBELS_DORF_ACC,
    label: (
      <span style={{...styles.headerCell, ...styles.notSortable}}>
        DORF, %<br/>accuracy
      </span>
    ),
    disableSort: true,
    width: 85,
    style: styles.dataCell,
    cellRenderer({rowData}) { // eslint-disable-line react/prop-types
      return createInputCell(DIBELS_DORF_ACC, rowData.id, doc, onDocChanged);
    }
  }, {
    dataKey: DIBELS_DORF_WPM,
    label: (
      <span style={{...styles.headerCell, ...styles.notSortable}}>
        DORF,<br/>words/min
      </span>
    ),
    disableSort: true,
    width: 85,
    style: styles.dataCell,
    cellRenderer({rowData}) { // eslint-disable-line react/prop-types
      return createInputCell(DIBELS_DORF_WPM, rowData.id, doc, onDocChanged);
    }
  }, {
    dataKey: INSTRUCTIONAL_NEEDS,
    label: (
      <div style={{...styles.headerCell, ...styles.notSortable, marginLeft: 10}}>
        <div>Instructional needs?</div>
        <div style={{fontWeight: 'normal'}}>(eg, blending, attention)</div>
      </div>
    ),
    disableSort: true,
    width: 140,
    flexGrow: 1,
    style: {...styles.dataCell, marginLeft: 10, marginRight: 20},
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
    iep(student) { return hasActiveIep(student) ? 'IEP' : null; },
    english_learner_level(student) { return englishLearnerLinkText(districtKey, student); },
    mtss(student) { return renderMtss(student.mtss, nowMoment); },
    [F_AND_P_ENGLISH](student) { return readDoc(doc, student.id, F_AND_P_ENGLISH) || 'a'; },
    [DIBELS_DORF_ACC](student) { return parseInt(readDoc(doc, student.id, DIBELS_DORF_ACC), 10) || Number.NEGATIVE_INFINITY; },
    [DIBELS_DORF_WPM](student) { return parseInt(readDoc(doc, student.id, DIBELS_DORF_WPM), 10) || Number.NEGATIVE_INFINITY; },
    [INSTRUCTIONAL_NEEDS](student) { return readDoc(doc, student.id, INSTRUCTIONAL_NEEDS); }
  };
}


// Bind the input to the of state for (benchmarkAssessmentKey, studentId)
//
// By using value/onChange, this results in an immediate state change, which,
// if that column is being sorted by, leads to unexpected UX - the row
// jumps under the user, and the cursor moves to another input box.
// Just changing to defaultValue breaks the sorting altogether (not sure why),
// so to workaround for now, sort is disabled on those columns.
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

// Because of authorization rules, sometimes the user will be able to 
// see the full profile, and sometimes not.
function renderStudentName(currentEducatorId, student) {
  const nameEl = (student.homeroom && student.homeroom.educator.id === currentEducatorId)
    ? <a tabIndex={-1} style={{fontSize: 14}} href={`/students/${student.id}`} target="_blank" rel="noopener noreferrer">{student.first_name} {student.last_name}</a>
    : `${student.first_name} ${student.last_name}`;
  
  return nameEl;
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

function englishLearnerLinkText(districtKey, rowData) {
  if (!isEnglishLearner(districtKey, rowData.limited_english_proficiency)) return null;
  const level = accessLevelNumber(rowData.access);
  return (level) ? `Level ${level}` : 'ELL';
}



const styles = {
  headerCell: {
    fontSize: 12
  },
  notSortable: {
    cursor: 'default'
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
