import React from 'react';
import PropTypes from 'prop-types';
import tabProptypes from './tabPropTypes';
import {DIBELS_LNF} from '../reading/thresholds';
import {mostRecentDataPoint, shouldHighlight} from './dibelsParsing';
import {Tab} from './Tabs';


export default class LetterNamingFluencyTab extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {onClick, student, readerJson} = this.props;
    
    const dataPoint = mostRecentDataPoint(readerJson, DIBELS_LNF);    
    if (!dataPoint) return null;
    const isOrange = shouldHighlight(dataPoint, student.grade, nowFn());
    return (
      <Tab
        text="Letter naming fluency"
        orange={isOrange}
        onClick={onClick}
      />
    );
  }
}
LetterNamingFluencyTab.propTypes = tabProptypes;
LetterNamingFluencyTab.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
