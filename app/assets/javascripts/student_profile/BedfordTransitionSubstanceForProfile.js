import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import NoteText from '../components/NoteText';


// Render part of the transition note inline
export default function BedfordTransitionSubstanceForProfile(props) {
  const {importedForm, studentFirstName} = props;
  const formJson = importedForm.form_json;

  const itemEls = _.compact([
    renderServices(importedForm),
    maybeRender(`What else should new teachers know about ${studentFirstName}?`, formJson[SPECIFIC_INFO]),
    maybeRender(`What did you wish you knew about ${studentFirstName} at the start of the year?`, formJson[WISH_YOU_KNEW]),
    maybeRender(`What helped you connect with ${studentFirstName}?`, formJson[HELPED_CONNECT])
  ]);
  return (
    <div>
      {itemEls.map((itemEl, index) => (
        <div style={{marginBottom: 15}} key={index}>{itemEl}</div>
      ))}
    </div>
  );
}

BedfordTransitionSubstanceForProfile.propTypes = {
  importedForm: PropTypes.object.isRequired,
  studentFirstName: PropTypes.string.isRequired
};

function maybeRender(prompt, formValue) {
  if (!formValue || _.isEmpty(formValue)) return null;
  return (
    <div>
      <div>{prompt}</div>
      <NoteText text={formValue} style={{marginTop: 0}} />
    </div>
  );
}

function renderServices(importedForm) {
  const servicePrompts = [
    'LLI',
    'Reading Intervention (w/ specialist)',
    'Math Intervention (w/ consult from SD)'
  ];
  const serviceTexts = _.compact(servicePrompts.map(prompt => {
    return (importedForm.form_json[prompt]) ? prompt : null;
  }));

  if (serviceTexts.length === 0) return 'No services during 2018-2019';
  return (
    <div>
      <div>Services during 2018-2019</div>
      {serviceTexts.map(text => <div key={text}>- {text}</div>)}
    </div>
  );
}


const SPECIFIC_INFO = "Please share any specific information you want the teacher to know beyond the report card. This could include notes on interventions, strategies, academic updates that aren't documented in an IEP or 504. If information is in a file please be sure to link it here or share w/ Jess via google doc folder or paper copy";
const WISH_YOU_KNEW = 'Is there any key information that you wish you knew about this student in September?';
const HELPED_CONNECT = 'Please share anything that helped you connect with this student that might be helpful to the next teacher.';
