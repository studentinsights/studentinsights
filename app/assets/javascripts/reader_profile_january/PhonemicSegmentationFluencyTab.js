import React from 'react';
import tabProptypes from './tabPropTypes';
import {DIBELS_PSF} from '../reading/thresholds';
import GenericDibelsTab from './GenericDibelsTab';


export default class PhonemicSegmentationFluencyTab extends React.Component {
  render() {
    return (
      <GenericDibelsTab
        {...this.props}
        tabText="Phonemic segmentation fluency"
        benchmarkAssessmentKey={DIBELS_PSF}
      />
    );
  }
}
PhonemicSegmentationFluencyTab.propTypes = tabProptypes;
