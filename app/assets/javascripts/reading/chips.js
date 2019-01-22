import React from 'react';
import _ from 'lodash';
import HelpBubble, {
  modalFullScreenFlex,
  dialogFullScreenFlex
} from '../components/HelpBubble';
import {hasActive504Plan} from '../helpers/PerDistrict';
import {isEnglishLearner, accessLevelNumber} from '../helpers/language';
import {toMomentFromRailsDate} from '../helpers/toMoment';
import {toSchoolYear, firstDayOfSchool} from '../helpers/schoolYear';
import {hasActiveIep} from '../helpers/specialEducation';
import PerDistrictContainer from '../components/PerDistrictContainer';
import IepDialog from '../student_profile/IepDialog';
import LanguageStatusLink from '../student_profile/LanguageStatusLink'; 
import EdPlansPanel from '../student_profile/EdPlansPanel';


export function render504Chip(districtKey, student, props = {}) {
  if (!hasActive504Plan(student.plan_504)) return null;

  const studentName = `${student.first_name} ${student.last_name}`;
  return (
    <HelpBubble
      style={{marginLeft: 0, display: 'block'}}
      teaser="504"
      linkStyle={{fontSize: 14}}
      modalStyle={modalFullScreenFlex}
      dialogStyle={dialogFullScreenFlex}
      title={`${student.first_name}'s 504 plan`}
      withoutSpacer={true}
      withoutContentWrapper={true}
      content={(
        <PerDistrictContainer districtKey={districtKey}>
          <EdPlansPanel
            edPlans={student.ed_plans}
            studentName={studentName}
          />
        </PerDistrictContainer>
      )}
      {...props}
    />
  );
}

export function renderIepChip(districtKey, student, props = {}) {
  if (!hasActiveIep(student)) return null;
  return (
    <PerDistrictContainer districtKey={districtKey}>
      <IepDialog
        student={student}
        iepDocument={student.latest_iep_document}
        linkEl="IEP"
        {...props}
      />
    </PerDistrictContainer>
  );
}

export function renderEnglishLearnerChip(districtKey, student, props = {}) {
  if (!isEnglishLearner(districtKey, student.limited_english_proficiency)) return null;
  const linkText = englishLearnerLinkText(districtKey, student);
  return (
    <PerDistrictContainer districtKey={districtKey}>
      <LanguageStatusLink
        linkEl={linkText}
        style={{fontSize: 14}}
        studentFirstName={student.first_name}
        ellTransitionDate={student.ell_transition_date}
        limitedEnglishProficiency={student.limited_english_proficiency}
        access={student.access}
        {...props}
      />
    </PerDistrictContainer>
  );
}

function englishLearnerLinkText(districtKey, rowData) {
  if (!isEnglishLearner(districtKey, rowData.limited_english_proficiency)) return null;
  const level = accessLevelNumber(rowData.access);
  return (level) ? `Level ${level}` : 'ELL';
}

// only render this school year and 2 years back (push to server?)
export function renderMtss(mtssList, nowMoment) {
  if (mtssList.length === 0) return null;

  const startOfSchoolYearMoment = firstDayOfSchool(toSchoolYear(nowMoment.toDate()) - 2);
  const mtssMoments = mtssList.map(mtss => toMomentFromRailsDate(mtss.recorded_at));
  const mtssMomentsThisYear = mtssMoments.filter(mtssMoment => mtssMoment.isAfter(startOfSchoolYearMoment));
  const latestMtssMoment = _.last(mtssMomentsThisYear.sort());
  if (!latestMtssMoment) return null;

  return latestMtssMoment.format('M/D/YY');
}
