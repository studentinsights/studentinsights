import React from 'react';
import tabProptypes from './tabPropTypes';
import {roundedWidaLevel, hasAnyAccessData} from '../helpers/language';
import {NoInformation, Tab} from './Tabs';

export default class AccessTab extends React.Component {
  render() {
    const {onClick, readerJson} = this.props;
    const {access} = readerJson;
    
    const oralAccessKey = 'oral';
    if (!hasAnyAccessData(access)) {
      return <NoInformation />;
    } else if (access[oralAccessKey] === null || access[oralAccessKey] === undefined) {
      return <NoInformation />;
    }

    // TODO refactor language.js / <AccessPanel />
    const dataPoint = access[oralAccessKey];
    const performanceLevel = dataPoint && dataPoint.performance_level;
    // Rounding is meaningful educationally; see `roundedWidaLevel` for more
    const roundedScore = roundedWidaLevel(performanceLevel, {shouldRenderFractions: true});
    const orange = (roundedScore < 6);
    return (
      <Tab
        text="ACCESS Oral Language"
        orange={orange}
        onClick={onClick}
      />
    );
  }
}
AccessTab.propTypes = tabProptypes;
