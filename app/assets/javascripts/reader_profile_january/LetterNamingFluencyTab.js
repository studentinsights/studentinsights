import React from 'react';
import tabProptypes from './tabPropTypes';
import {DIBELS_LNF} from '../reading/thresholds';
import GenericDibelsTab from './GenericDibelsTab';


export default class LetterNamingFluencyTab extends React.Component {
  render() {
    return (
      <GenericDibelsTab
        {...this.props}
        tabText="Letter naming fluency"
        benchmarkAssessmentKey={DIBELS_LNF}
      />
    );
  }
}
LetterNamingFluencyTab.propTypes = tabProptypes;
