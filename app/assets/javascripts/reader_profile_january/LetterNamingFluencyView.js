import React from 'react';
import expandedViewPropTypes from './expandedViewPropTypes';
import {DIBELS_LNF} from '../reading/thresholds';
import {PHONICS_FLUENCY} from './instructionalStrategies';
import GenericDibelsView from './GenericDibelsView';


export default function LetterNamingFluencyView(props) {
  return (
    <GenericDibelsView
      {...props}
      titleText="Letter naming fluency"
      benchmarkAssessmentKey={DIBELS_LNF}
      categoryKey={PHONICS_FLUENCY}
      urls={MATERIAL_URLS}
    />
  );
}
LetterNamingFluencyView.propTypes = expandedViewPropTypes;

const MATERIAL_URLS = {
  'KF-fall': 'LetterNamingFluency-K1',
  'KF-winter': 'LetterNamingFluency-K2'
};
