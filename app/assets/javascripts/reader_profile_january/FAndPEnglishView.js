import React from 'react';
import {F_AND_P_ENGLISH} from '../reading/thresholds';
import expandedViewPropTypes from './expandedViewPropTypes';
import {COMPREHENSION} from './instructionalStrategies';
import GenericDibelsView from './GenericDibelsView';


export default class FAndPEnglishView extends React.Component {
  render() {
    return (
      <GenericDibelsView
        {...this.props}
        titleText="F&P English"
        benchmarkAssessmentKey={F_AND_P_ENGLISH}
        categoryKey={COMPREHENSION}
        urls={{}}
      />
    );
  }
}
FAndPEnglishView.propTypes = expandedViewPropTypes;
