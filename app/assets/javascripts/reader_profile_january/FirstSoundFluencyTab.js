import React from 'react';
import PropTypes from 'prop-types';
import tabProptypes from './tabPropTypes';
import {DIBELS_FSF} from '../reading/thresholds';
import {mostRecentDataPoint, shouldHighlight} from './dibelsParsing';
import {Tab} from './Tabs';


export default class FirstSoundFluencyTab extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {onClick, student, readerJson} = this.props;
    
    const dataPoint = mostRecentDataPoint(readerJson, DIBELS_FSF);    
    if (!dataPoint) return null;
    const isOrange = shouldHighlight(dataPoint, student.grade, nowFn());
    return (
      <Tab
        text="First sound fluency"
        orange={isOrange}
        onClick={onClick}
      />
    );
  }
}
FirstSoundFluencyTab.propTypes = tabProptypes;
FirstSoundFluencyTab.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
