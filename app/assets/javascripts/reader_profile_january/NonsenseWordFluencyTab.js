import React from 'react';
import tabProptypes from './tabPropTypes';
import {DIBELS_NWF_CLS} from '../reading/thresholds';
import GenericDibelsTab from './GenericDibelsTab';


export default class NonsenseWordFluencyTab extends React.Component {
  render() {
    return (
      <GenericDibelsTab
        {...this.props}
        tabText="Nonsense word fluency"
        benchmarkAssessmentKey={DIBELS_NWF_CLS}
      />
    );
  }
}
NonsenseWordFluencyTab.propTypes = tabProptypes;
