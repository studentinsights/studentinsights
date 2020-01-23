import React from 'react';
import tabProptypes from './tabPropTypes';
import {mostRecentDataPoint} from './dibelsParsing';
import {F_AND_P_ENGLISH} from '../reading/thresholds';
import {Tab} from './Tabs';


export default class FAndPEnglishTab extends React.Component {
  render() {
    const {style, onClick, readerJson} = this.props;
    
    const dataPoint = mostRecentDataPoint(readerJson, F_AND_P_ENGLISH);
    if (!dataPoint) return null;
    return (
      <Tab
        style={style}
        text="F&P English"
        orange={null} // TODO(kr)
        onClick={onClick}
      />
    );
  }
}
FAndPEnglishTab.propTypes = tabProptypes;
