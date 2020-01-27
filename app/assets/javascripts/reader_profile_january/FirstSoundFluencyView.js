import React from 'react';
import expandedViewPropTypes from './expandedViewPropTypes';
import {DIBELS_FSF} from '../reading/thresholds';
import {PHONOLOGICAL_AWARENESS} from './instructionalStrategies';
import GenericDibelsView from './GenericDibelsView';


export default function FirstSoundFluencyView(props) {
  return (
    <GenericDibelsView
      {...props}
      titleText="First sound fluency"
      benchmarkAssessmentKey={DIBELS_FSF}
      categoryKey={PHONOLOGICAL_AWARENESS}
      urls={MATERIAL_URLS}
    />
  );
}
FirstSoundFluencyView.propTypes = expandedViewPropTypes;

const MATERIAL_URLS = {
  'KF-fall': 'FirstSoundFluency-KF-fall',
  'KF-winter': 'FirstSoundFluency-KF-winter'
};
