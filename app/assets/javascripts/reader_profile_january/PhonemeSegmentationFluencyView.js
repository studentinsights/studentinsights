import React from 'react';
import expandedViewPropTypes from './expandedViewPropTypes';
import {DIBELS_PSF} from '../reading/thresholds';
import {PHONOLOGICAL_AWARENESS} from './instructionalStrategies';
import GenericDibelsView from './GenericDibelsView';


export default function PhonemeSegmentationFluencyView(props) {
  return (
    <GenericDibelsView
      {...props}
      titleText="Phoneme segmentation fluency"
      benchmarkAssessmentKey={DIBELS_PSF}
      categoryKey={PHONOLOGICAL_AWARENESS}
      urls={MATERIAL_URLS}
    />
  );
}
PhonemeSegmentationFluencyView.propTypes = expandedViewPropTypes;

const MATERIAL_URLS = {
  'KF-winter': 'PhonemeSegmentationFluency-KF-winter',
  'KF-spring': 'PhonemeSegmentationFluency-KF-spring',
  '1-fall': 'PhonemeSegmentationFluency-1-fall'
};


