import React from 'react';
import tabProptypes from './tabPropTypes';
import {DIBELS_PSF} from '../reading/thresholds';
import GenericDibelsTab from './GenericDibelsTab';


export default class PhonemeSegmentationFluencyTab extends React.Component {
  render() {
    return (
      <GenericDibelsTab
        {...this.props}
        tabText="Phoneme segmentation fluency"
        benchmarkAssessmentKey={DIBELS_PSF}
      />
    );
  }
}
PhonemeSegmentationFluencyTab.propTypes = tabProptypes;
