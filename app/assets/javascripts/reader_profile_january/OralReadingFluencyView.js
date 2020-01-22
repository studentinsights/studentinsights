import React from 'react';
import expandedViewPropTypes from './expandedViewPropTypes';
import {DIBELS_DORF_WPM} from '../reading/thresholds';
import {PHONICS_FLUENCY} from './instructionalStrategies';
import GenericDibelsView from './GenericDibelsView';


export default function OralReadingFluencyView(props) {
  return (
    <GenericDibelsView
      {...props}
      titleText="Oral reading fluency"
      benchmarkAssessmentKey={DIBELS_DORF_WPM}
      categoryKey={PHONICS_FLUENCY}
      urls={MATERIAL_URLS}
    />
  );
}
OralReadingFluencyView.propTypes = expandedViewPropTypes;

const MATERIAL_URLS = {
  'KF-fall': 'OralReadingFluency-K1',
  'KF-winter': 'OralReadingFluency-K2'
};



