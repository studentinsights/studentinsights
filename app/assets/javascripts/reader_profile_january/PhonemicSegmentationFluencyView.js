import React from 'react';
import expandedViewPropTypes from './expandedViewPropTypes';
import {DIBELS_PSF} from '../reading/thresholds';
import {PHONOLOGICAL_AWARENESS} from './instructionalStrategies';
import GenericDibelsView from './GenericDibelsView';


export default function PhonemicSegmentationFluencyView(props) {
  return (
    <GenericDibelsView
      {...props}
      titleText="Phonemic segmentation fluency"
      benchmarkAssessmentKey={DIBELS_PSF}
      categoryKey={PHONOLOGICAL_AWARENESS}
      urls={MATERIAL_URLS}
    />
  );
}
PhonemicSegmentationFluencyView.propTypes = expandedViewPropTypes;

const MATERIAL_URLS = {
  'KF-fall': 'PhonemicSegmentationFluency-K1',
  'KF-winter': 'PhonemicSegmentationFluency-K2'
};


