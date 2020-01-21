import React from 'react';
import tabProptypes from './tabPropTypes';
import {DIBELS_DORF_WPM} from '../reading/thresholds';
import GenericDibelsTab from './GenericDibelsTab';


export default class OralReadingFluencyTab extends React.Component {
  render() {
    console.log('props', this.props);
    return (
      <GenericDibelsTab
        {...this.props}
        tabText="Oral reading fluency"
        benchmarkAssessmentKey={DIBELS_DORF_WPM}
      />
    );
  }
}
OralReadingFluencyTab.propTypes = tabProptypes;
