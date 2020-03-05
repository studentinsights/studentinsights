import React from 'react';
import tabProptypes from './tabPropTypes';
import {F_AND_P_ENGLISH} from '../reading/thresholds';
import GenericDibelsTab from './GenericDibelsTab';


export default class FAndPEnglishTab extends React.Component {
  render() {
    return (
      <GenericDibelsTab
        {...this.props}
        tabText="F&P English"
        benchmarkAssessmentKey={F_AND_P_ENGLISH}
      />
    );
  }
}
FAndPEnglishTab.propTypes = tabProptypes;
