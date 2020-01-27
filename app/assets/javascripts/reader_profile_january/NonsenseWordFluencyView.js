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

const MATERIAL_URLS = {};