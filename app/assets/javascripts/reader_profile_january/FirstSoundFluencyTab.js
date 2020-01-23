import React from 'react';
import tabProptypes from './tabPropTypes';
import {DIBELS_FSF} from '../reading/thresholds';
import GenericDibelsTab from './GenericDibelsTab';


export default class FirstSoundFluencyTab extends React.Component {
  render() {
    return (
      <GenericDibelsTab
        {...this.props}
        tabText="First sound fluency"
        benchmarkAssessmentKey={DIBELS_FSF}
      />
    );
  }
}
FirstSoundFluencyTab.propTypes = tabProptypes;
