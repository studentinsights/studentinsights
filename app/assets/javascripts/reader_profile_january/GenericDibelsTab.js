import React from 'react';
import PropTypes from 'prop-types';
import tabProptypes from './tabPropTypes';
import {mostRecentDataPoint, shouldHighlight} from './dibelsParsing';
import {Tab, NoInformation} from './Tabs';


export default class GenericDibelsTab extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {style, onClick, student, readerJson, tabText, benchmarkAssessmentKey} = this.props;
    const dataPoint = mostRecentDataPoint(readerJson, benchmarkAssessmentKey);
    if (!dataPoint) {
      return <NoInformation />;
    }
    
    const isOrange = shouldHighlight(dataPoint, student.grade, nowFn());
    return (
      <Tab
        style={style}
        text={tabText}
        orange={isOrange}
        onClick={onClick}
      />
    );
  }
}
GenericDibelsTab.propTypes = {
  ...tabProptypes,
  benchmarkAssessmentKey: PropTypes.string.isRequired,
  tabText: PropTypes.string.isRequired
};
GenericDibelsTab.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
