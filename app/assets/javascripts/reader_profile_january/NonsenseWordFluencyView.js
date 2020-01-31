import React from 'react';
import expandedViewPropTypes from './expandedViewPropTypes';
import {DIBELS_NWF_CLS} from '../reading/thresholds';
import {PHONICS_FLUENCY} from './instructionalStrategies';
import GenericDibelsView from './GenericDibelsView';


export default function NonsenseWordFluencyView(props) {
  return (
    <GenericDibelsView
      {...props}
      titleText="Nonsense word fluency"
      benchmarkAssessmentKey={DIBELS_NWF_CLS}
      categoryKey={PHONICS_FLUENCY}
      urls={MATERIAL_URLS}
    />
  );
}
NonsenseWordFluencyView.propTypes = expandedViewPropTypes;

const MATERIAL_URLS = {
  'KF-winter': 'NonsenseWordFluency-KF-winter', // optional, changed in January 2020
  'KF-spring': 'NonsenseWordFluency-KF-spring',
  '1-fall': 'NonsenseWordFluency-1-fall',
  '1-winter': 'NonsenseWordFluency-1-winter',
  '1-spring': 'NonsenseWordFluency-1-spring',
  '2-fall': 'NonsenseWordFluency-2-fall'
};