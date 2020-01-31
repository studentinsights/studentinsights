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
  '1-fall': [
    'OralReadingFluency-1-fall'
  ],
  '1-winter': [
    'OralReadingFluency-1-winter-21',
    'OralReadingFluency-1-winter-22',
    'OralReadingFluency-1-winter-23'
  ],
  '1-spring': [
    'OralReadingFluency-1-spring-31',
    'OralReadingFluency-1-spring-32',
    'OralReadingFluency-1-spring-33'
  ]
};